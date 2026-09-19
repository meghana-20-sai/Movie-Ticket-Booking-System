import { Show } from '../../models/Show.js';
import { Coupon } from '../../models/Coupon.js';

export const budgetCommandService = {
  async planBudget(entities = {}) {
    const budget = entities.maxBudget || 1000;
    const ticketsCount = entities.ticketsCount || 2;
    const foodItems = entities.foodItems || [];

    // Find affordable active shows
    const shows = await Show.find({ status: 'active', startTime: { $gte: new Date() } })
      .populate('movie', 'title poster backdrop rating certification language')
      .populate('theatre', 'name city')
      .populate('screen', 'name format')
      .sort({ basePrice: 1 })
      .limit(3);

    if (!shows.length) {
      return {
        type: 'ERROR',
        message: 'No active shows available to calculate budget.',
      };
    }

    const selectedShow = shows[0];
    const ticketSubtotal = selectedShow.basePrice * ticketsCount;
    const foodSubtotal = foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const convenienceFee = Math.round(ticketSubtotal * 0.08); // 8% fee
    const grossTotal = ticketSubtotal + foodSubtotal + convenienceFee;

    // Apply best available coupon
    const coupons = await Coupon.find({ isActive: true });
    let discount = 0;
    let appliedCoupon = null;

    if (coupons.length > 0) {
      appliedCoupon = coupons[0];
      if (appliedCoupon.discountType === 'percentage') {
        discount = Math.round((grossTotal * appliedCoupon.discountValue) / 100);
        if (appliedCoupon.maxDiscount) discount = Math.min(discount, appliedCoupon.maxDiscount);
      } else {
        discount = appliedCoupon.discountValue;
      }
    }

    const finalTotal = Math.max(0, grossTotal - discount);
    const withinBudget = finalTotal <= budget;
    const difference = Math.abs(budget - finalTotal);

    return {
      type: 'BUDGET_BREAKDOWN',
      message: withinBudget
        ? `✅ Budget Optimized: Total ₹${finalTotal} fits within your ₹${budget} budget!`
        : `⚠️ Budget Alert: Total is ₹${finalTotal} (₹${difference} over ₹${budget}). Here is the breakdown:`,
      budget,
      breakdown: {
        ticketsCount,
        ticketPricePerSeat: selectedShow.basePrice,
        ticketsSubtotal: ticketSubtotal,
        foodSubtotal,
        foodItems,
        convenienceFee,
        discount,
        couponCode: appliedCoupon?.code,
        finalTotal,
        remainingBudget: withinBudget ? difference : 0,
        exceededAmount: !withinBudget ? difference : 0,
      },
      show: selectedShow,
      cheaperOptions: !withinBudget
        ? [
            'Select Classic Tier seating instead of Prime',
            'Remove add-on beverage / popcorn',
            'Apply coupon promo code SMARTCINE10',
          ]
        : [],
    };
  },
};
