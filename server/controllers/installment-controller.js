const InstallmentPlan = require("../models/InstallmentPlan");
const ScoringEvent = require("../models/ScoringEvent");
const Customer = require("../models/Customer");
const { updateScore } = require("../lib/scoringEngine");
const Order = require("../models/Order");

exports.payInstallment = async (req, res) => {
  try {
    const { planId } = req.params;
    const { index } = req.body;
    const customerId = req.user?.customerId;

    const plan = await InstallmentPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // 🔥 PAY LATER → one-shot payment
    if (plan.type === "pay_later") {
      plan.status = "paid";
      plan.paidAt = new Date();
      await plan.save();
      await Order.findByIdAndUpdate(plan.orderId, { status: "paid" });

      // --- FIXED: Immediate Score Update for Pay Later ---
      const bonusPoints = plan.dueDate < new Date() ? -20 : 8;

      const latestOrders = await Order.find({ customerId });
      const customer = await Customer.findById(customerId);

      await updateScore(
        customer,
        latestOrders,
        {
          eventType: "pay_later_payment",
          planId: plan._id,
          amount: plan.totalAmount,
          late: plan.dueDate < new Date(),
        },
        { bonusPoints }
      );

      await ScoringEvent.create({
        customerId,
        eventType: "pay_later_payment",
        payload: {
          planId: plan._id,
          amount: plan.totalAmount,
          late: plan.dueDate < new Date(),
        },
        processed: true,
        processedAt: new Date(),
      });

      return res.json({ success: true, plan });
    }

    // 🔥 INSTALLMENT LOGIC
    const installment = plan.schedule[index];
    if (!installment)
      return res.status(404).json({ message: "Installment not found" });

    installment.status = "paid";
    installment.paidAt = new Date();
    installment.late = installment.dueDate < new Date();

    const remaining = plan.schedule.filter((x) => x.status !== "paid").length;

    plan.status = remaining === 0 ? "completed" : "partial";
    await plan.save();

    if (plan.status === "completed")
      await Order.findByIdAndUpdate(plan.orderId, { status: "paid" });

    // --- FIXED: Immediate Score Update with Bonus ---
    const bonusPoints = installment.late ? -10 : 5;

    // Fetch latest orders to ensure accuracy
    const latestOrders = await Order.find({ customerId });
    const customer = await Customer.findById(customerId);

    // Update score immediately
    await updateScore(
      customer,
      latestOrders,
      {
        eventType: "installment_payment",
        planId,
        index,
        late: installment.late,
      },
      { bonusPoints }
    );

    // Create event BUT mark as processed to avoid double-counting by worker
    await ScoringEvent.create({
      customerId,
      eventType: "installment_payment",
      payload: {
        planId,
        index,
        late: installment.late,
        amount: installment.amount,
      },
      processed: true, // Worker will skip this
      processedAt: new Date(),
    });

    // Check for rapid repayment (suspicious activity)
    // Count how many installments in this plan were paid *today*
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const paidToday = plan.schedule.filter(
      (s) => s.status === "paid" && s.paidAt >= todayStart
    ).length;

    // If more than 2 paid today (including the one just paid), flag it
    // Note: The current one is already marked paid in memory but not saved?
    // Wait, we updated `installment` object above but haven't saved `plan` yet?
    // Actually we call `plan.save()` below.
    // The filter above runs on `plan.schedule` which contains the updated `installment`.

    if (paidToday >= 2) {
      const SuspiciousActivity = require("../models/SuspiciousActivity");
      await SuspiciousActivity.create({
        customerId,
        type: "rapid_repayment",
        details: {
          planId,
          paidCountToday: paidToday,
          reason: "Multiple installments paid instantly to boost score",
        },
      });
    }

    // Immediate score refresh so UI moves without waiting for worker
    res.json({ success: true, plan });
  } catch (e) {
    res.status(500).json({ message: "Payment failed" });
  }
};
