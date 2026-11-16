/**
 * B2B 阶梯定价引擎 + 演示数据（纯逻辑）
 */
"use strict";

// 商品与阶梯价（原创虚构）
const PRODUCTS = [
  {
    id: "cup", name: "定制陶瓷马克杯（含单色印刷）", unit: "只",
    basePrice: 12.0,
    ladder: [
      { min: 1,     price: 12.0 },
      { min: 100,   price: 9.5 },
      { min: 500,   price: 7.8 },
      { min: 2000,  price: 6.2 },
      { min: 10000, price: 5.0 },
    ],
  },
  {
    id: "bag", name: "帆布袋（丝网印 logo）", unit: "个",
    basePrice: 15.0,
    ladder: [
      { min: 1,    price: 15.0 },
      { min: 50,   price: 11.8 },
      { min: 200,  price: 9.6 },
      { min: 1000, price: 7.9 },
      { min: 5000, price: 6.5 },
    ],
  },
  {
    id: "pen", name: "金属签字笔（激光刻字）", unit: "支",
    basePrice: 8.5,
    ladder: [
      { min: 1,    price: 8.5 },
      { min: 100,  price: 6.9 },
      { min: 500,  price: 5.5 },
      { min: 2000, price: 4.2 },
    ],
  },
  {
    id: "box", name: "精装礼盒（天地盖）", unit: "套",
    basePrice: 22.0,
    ladder: [
      { min: 1,    price: 22.0 },
      { min: 50,   price: 18.5 },
      { min: 300,  price: 15.0 },
      { min: 1000, price: 12.5 },
      { min: 5000, price: 10.8 },
    ],
  },
];

// 客户等级折扣（在阶梯价基础上再折）
const TIERS = [
  { id: "retail",  name: "零售客户", discount: 1.00, note: "无等级折扣" },
  { id: "silver",  name: "银牌经销商", discount: 0.95, note: "额外 95 折" },
  { id: "gold",    name: "金牌经销商", discount: 0.90, note: "额外 9 折 + 账期 30 天" },
  { id: "platinum",name: "铂金战略客户", discount: 0.85, note: "额外 85 折 + 账期 60 天 + 专属客服" },
];

const PricingEngine = {
  /** 取数量对应阶梯档 */
  ladderStep(product, qty) {
    let step = product.ladder[0];
    for (const s of product.ladder) {
      if (qty >= s.min) step = s;
    }
    return step;
  },

  /** 单价 = 阶梯价 × 等级折扣，保留 2 位 */
  unitPrice(product, qty, tier) {
    return +(this.ladderStep(product, qty).price * tier.discount).toFixed(2);
  },

  quote(product, qty, tier) {
    const step = this.ladderStep(product, qty);
    const unit = this.unitPrice(product, qty, tier);
    const listUnit = step.price;                        // 未折阶梯价
    return {
      qty,
      stepMin: step.min,
      listUnit,
      unit,
      amount: +(unit * qty).toFixed(2),
      listAmount: +(listUnit * qty).toFixed(2),
      tierDiscount: +(listUnit * qty - unit * qty).toFixed(2),
      nextStep: product.ladder.find(s => s.min > qty) || null,
    };
  },
};

if (typeof module !== "undefined") module.exports = { PricingEngine, PRODUCTS, TIERS };
