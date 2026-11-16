// B2B 报价 UI 逻辑
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => "¥" + n.toLocaleString("zh-CN", { minimumFractionDigits: 2 });

  const state = { productId: "cup", tierId: "retail", qty: 100 };
  const lines = []; // 报价单行

  /* ---------- 初始化 ---------- */
  $("#productSelect").innerHTML = PRODUCTS.map(p =>
    `<option value="${p.id}">${p.name}</option>`).join("");
  $("#tierRow").innerHTML = TIERS.map(t =>
    `<button class="tier-btn ${t.id === state.tierId ? "active" : ""}" data-tier="${t.id}">${t.name}</button>`).join("");

  function product() { return PRODUCTS.find(p => p.id === state.productId); }
  function tier() { return TIERS.find(t => t.id === state.tierId); }

  /* ---------- 渲染 ---------- */
  function renderLadder() {
    const p = product();
    const hit = PricingEngine.ladderStep(p, state.qty);
    $("#ladderTable").innerHTML = p.ladder.map(s => `
      <div class="ld-row ${s.min === hit.min ? "hit" : ""}">
        <span class="min">≥ ${s.min.toLocaleString()} ${p.unit}</span>
        <span>¥${s.price.toFixed(2)}/${p.unit}</span>
      </div>`).join("");
  }

  function renderCalc() {
    const q = PricingEngine.quote(product(), state.qty, tier());
    $("#calcBox").innerHTML = `
      <div class="calc-row"><span>阶梯档位</span><b>≥ ${q.stepMin.toLocaleString()} ${product().unit}</b></div>
      <div class="calc-row"><span>阶梯单价</span><b>${fmt(q.listUnit)}</b></div>
      <div class="calc-row"><span>等级折扣（${tier().name}）</span><b class="save">省 ${fmt(q.tierDiscount)}</b></div>
      <div class="calc-unit">${fmt(q.unit)}<small style="font-size:13px;color:var(--muted)">/${product().unit}</small></div>
      <div class="calc-row"><span>小计（${q.qty} ${product().unit}）</span><b>${fmt(q.amount)}</b></div>
      ${q.nextStep ? `<p class="calc-next">💡 再买 ${(q.nextStep.min - q.qty).toLocaleString()} ${product().unit}可享 ¥${(q.nextStep.price * tier().discount).toFixed(2)}/${product().unit} 更低价</p>` : ""}
    `;
  }

  function renderQuote() {
    const table = $("#quoteTable");
    if (!lines.length) {
      table.innerHTML = `<tr><td style="color:var(--muted);text-align:center;padding:20px">报价单为空，试算后加入</td></tr>`;
      $("#quoteFoot").innerHTML = "";
      return;
    }
    table.innerHTML = `
      <tr><th>#</th><th>商品</th><th>数量</th><th>单价</th><th>金额</th><th></th></tr>` +
      lines.map((l, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${l.productName}<br><small style="color:var(--muted)">${l.tierName} · 阶梯≥${l.stepMin}</small></td>
          <td>${l.qty.toLocaleString()}</td>
          <td>${fmt(l.unit)}</td>
          <td>${fmt(l.amount)}</td>
          <td><button class="del" data-del="${i}">✕</button></td>
        </tr>`).join("");
    const total = lines.reduce((s, l) => s + l.amount, 0);
    const validUntil = new Date(Date.now() + (+$("#validDays").value || 15) * 864e5).toLocaleDateString("zh-CN");
    $("#quoteFoot").innerHTML = `
      <p style="font-size:12px;color:var(--muted);margin-bottom:6px">
        客户：${$("#customerInput").value.trim() || "（未填写）"} · 报价有效期至 ${validUntil}</p>
      合计 <strong>${fmt(total)}</strong>`;
  }

  function renderAll() { renderLadder(); renderCalc(); renderQuote(); }

  /* ---------- 事件 ---------- */
  $("#productSelect").addEventListener("change", (e) => { state.productId = e.target.value; renderLadder(); renderCalc(); });
  $("#tierRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tier]");
    if (!btn) return;
    state.tierId = btn.dataset.tier;
    document.querySelectorAll(".tier-btn").forEach(b => b.classList.toggle("active", b === btn));
    $("#tierNote").textContent = tier().note;
    renderCalc();
  });
  $("#qtyInput").addEventListener("input", (e) => {
    state.qty = Math.max(1, +e.target.value || 1);
    renderLadder(); renderCalc();
  });

  $("#addLineBtn").addEventListener("click", () => {
    const q = PricingEngine.quote(product(), state.qty, tier());
    lines.push({
      productName: product().name, qty: state.qty, unit: q.unit,
      amount: q.amount, stepMin: q.stepMin, tierName: tier().name,
    });
    renderQuote();
  });

  $("#quoteTable").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del]");
    if (!btn) return;
    lines.splice(+btn.dataset.del, 1);
    renderQuote();
  });

  $("#clearBtn").addEventListener("click", () => { lines.length = 0; renderQuote(); });
  $("#exportBtn").addEventListener("click", () => window.print());
  $("#customerInput").addEventListener("input", renderQuote);
  $("#validDays").addEventListener("input", renderQuote);

  $("#tierNote").textContent = tier().note;
  renderAll();
})();
