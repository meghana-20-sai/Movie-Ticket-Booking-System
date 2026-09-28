import { Coupon } from '../models/Coupon.js';

const BUILTIN_COUPONS = [
  {
    code: 'WELCOME100',
    description: 'Flat ₹100 instant discount on your first movie ticket booking',
    discountType: 'flat',
    discountValue: 100,
    minimumAmount: 200,
    maximumDiscount: 100,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'SMARTCINE10',
    description: '10% instant discount on all blockbuster movie shows & premiere tickets',
    discountType: 'percentage',
    discountValue: 10,
    minimumAmount: 200,
    maximumDiscount: 150,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'POPCORN50',
    description: 'Flat ₹50 OFF on Popcorn Concession Lounge Combos & Snacks',
    discountType: 'flat',
    discountValue: 50,
    minimumAmount: 150,
    maximumDiscount: 50,
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'IMAXPASS',
    description: 'Save ₹120 on Laser IMAX, ScreenX, and Dolby Atmos premium tickets',
    discountType: 'flat',
    discountValue: 120,
    minimumAmount: 300,
    maximumDiscount: 120,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'BLOCKBUSTER',
    description: 'Weekend Gala: 15% discount on night showtimes for group bookings',
    discountType: 'percentage',
    discountValue: 15,
    minimumAmount: 300,
    maximumDiscount: 200,
    validUntil: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

// @desc    Validate coupon code against subtotal
// @route   POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !subtotal) {
      return res.status(400).json({ success: false, message: 'Coupon code and subtotal are required' });
    }

    const cleanCode = code.toUpperCase().trim();
    let coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    // Fallback to built-in coupons if database has not yet seeded it
    if (!coupon) {
      const defaultCoupon = BUILTIN_COUPONS.find((c) => c.code === cleanCode);
      if (defaultCoupon) {
        try {
          coupon = await Coupon.create(defaultCoupon);
        } catch {
          coupon = defaultCoupon;
        }
      }
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    const now = new Date();
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      return res.status(400).json({ success: false, message: 'Coupon is not yet active.' });
    }

    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
    }

    if (subtotal < coupon.minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking amount of ₹${coupon.minimumAmount} required to use this coupon.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, subtotal);

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${discount}`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        finalDiscount: discount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons (Admin or active public)
// @route   GET /api/coupons
export const getCoupons = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const query = {};
    if (activeOnly === 'true') {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    }

    let coupons = await Coupon.find(query).sort({ createdAt: -1 });

    if (!coupons || coupons.length === 0) {
      // Auto-seed built-in coupons into DB so future queries return them
      try {
        await Coupon.insertMany(BUILTIN_COUPONS, { ordered: false });
        coupons = await Coupon.find(query).sort({ createdAt: -1 });
      } catch {
        coupons = BUILTIN_COUPONS;
      }
    }

    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
export const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minimumAmount, maximumDiscount, validFrom, validUntil, usageLimit } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minimumAmount: minimumAmount || 0,
      maximumDiscount: maximumDiscount || 500,
      validFrom: validFrom || Date.now(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: usageLimit || 1000,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
