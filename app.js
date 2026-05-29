/* ---------- Supabase 连接 ---------- */

// 这两个值是 Supabase 项目里的 anon/publishable 钥匙，专门给前端用、可以公开
const SUPABASE_URL = "https://dzxtwekqimacugvszkxc.supabase.co";
const SUPABASE_KEY = "sb_publishable_GpoiVwyQnLZNgOGqUuHb6A_TxY9a2-d";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- 默认菜单（仅供「恢复默认菜单」按钮使用） ---------- */

const defaultMenu = [
    // 热菜
    { id: 1,  name: "宫保鸡丁",   emoji: "🍗", image: "", price: 38, category: "hot",    description: "花生米配嫩滑鸡丁，香辣可口" },
    { id: 2,  name: "麻婆豆腐",   emoji: "🫕", image: "", price: 28, category: "hot",    description: "麻辣鲜香，下饭神器" },
    { id: 3,  name: "红烧肉",     emoji: "🥩", image: "", price: 48, category: "hot",    description: "肥而不腻，入口即化" },
    { id: 4,  name: "糖醋排骨",   emoji: "🍖", image: "", price: 52, category: "hot",    description: "酸甜适中，外酥里嫩" },
    { id: 5,  name: "水煮鱼",     emoji: "🐟", image: "", price: 58, category: "hot",    description: "鲜嫩鱼片，麻辣鲜香" },
    { id: 6,  name: "回锅肉",     emoji: "🥓", image: "", price: 36, category: "hot",    description: "经典川菜，肥瘦相间" },
    // 凉菜
    { id: 7,  name: "凉拌黄瓜",   emoji: "🥒", image: "", price: 16, category: "cold",   description: "爽脆可口，开胃小菜" },
    { id: 8,  name: "皮蛋豆腐",   emoji: "🥚", image: "", price: 18, category: "cold",   description: "滑嫩豆腐配松花蛋" },
    { id: 9,  name: "口水鸡",     emoji: "🍗", image: "", price: 32, category: "cold",   description: "麻辣鲜香，口水直流" },
    { id: 10, name: "凉拌木耳",   emoji: "🍄", image: "", price: 18, category: "cold",   description: "清爽木耳，健康美味" },
    // 汤类
    { id: 11, name: "番茄蛋汤",   emoji: "🍅", image: "", price: 15, category: "soup",   description: "经典家常汤，酸甜暖胃" },
    { id: 12, name: "紫菜蛋花汤", emoji: "🥣", image: "", price: 12, category: "soup",   description: "清淡鲜美，营养丰富" },
    { id: 13, name: "酸辣汤",     emoji: "🥘", image: "", price: 18, category: "soup",   description: "酸辣开胃，暖身暖心" },
    // 主食
    { id: 14, name: "米饭",       emoji: "🍚", image: "", price: 3,  category: "staple", description: "香喷喷白米饭" },
    { id: 15, name: "炒饭",       emoji: "🍳", image: "", price: 18, category: "staple", description: "蛋炒饭，粒粒分明" },
    { id: 16, name: "炸酱面",     emoji: "🍜", image: "", price: 22, category: "staple", description: "老北京风味，酱香浓郁" },
    { id: 17, name: "饺子",       emoji: "🥟", image: "", price: 25, category: "staple", description: "手工水饺，皮薄馅大" },
    // 饮品
    { id: 18, name: "柠檬水",     emoji: "🍋", image: "", price: 10, category: "drink",  description: "清爽柠檬，冰凉解暑" },
    { id: 19, name: "酸梅汤",     emoji: "🧃", image: "", price: 8,  category: "drink",  description: "传统酸梅汤，生津止渴" },
    { id: 20, name: "奶茶",       emoji: "🧋", image: "", price: 15, category: "drink",  description: "丝滑奶茶，香浓醇厚" },
    { id: 21, name: "可乐",       emoji: "🥤", image: "", price: 6,  category: "drink",  description: "冰镇可乐，快乐水" },
];

// 分类（供管理面板使用）
const categories = [
    { value: "hot",    label: "热菜" },
    { value: "cold",   label: "凉菜" },
    { value: "soup",   label: "汤类" },
    { value: "staple", label: "主食" },
    { value: "drink",  label: "饮品" },
];

/* ---------- 状态 ---------- */

let menuData = [];      // 启动时从 Supabase 加载
const cart = {};
let currentCategory = "all";
let editingId = null;
let pendingImage = "";
let ordersData = [];        // 当前加载的全部订单
let ordersFilter = "all";   // "all" | "today" | "date"
let ordersDateValue = "";   // 当 ordersFilter === "date" 时的具体日期 YYYY-MM-DD

/* ---------- 数据库读写 ---------- */

// 从 Supabase 读取菜单
async function loadMenu() {
    const { data, error } = await sb.from("menu").select("*").order("id");
    if (error) {
        console.error("加载菜单失败：", error);
        alert("加载菜单失败：" + error.message);
        return [];
    }
    return data || [];
}

async function insertDish(dish) {
    const { error } = await sb.from("menu").insert(dish);
    if (error) { alert("添加菜品失败：" + error.message); return false; }
    return true;
}

async function updateDishInDb(id, fields) {
    const { error } = await sb.from("menu").update(fields).eq("id", id);
    if (error) { alert("保存修改失败：" + error.message); return false; }
    return true;
}

async function deleteDishFromDb(id) {
    const { error } = await sb.from("menu").delete().eq("id", id);
    if (error) { alert("删除失败：" + error.message); return false; }
    return true;
}

async function insertOrder(items, total) {
    const { error } = await sb.from("orders").insert({ items, total });
    if (error) { alert("下单失败：" + error.message); return false; }
    return true;
}

// 读取所有订单（按下单时间倒序）
async function loadOrders() {
    const { data, error } = await sb.from("orders")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        console.error("加载订单失败：", error);
        return { data: [], error };
    }
    return { data: data || [], error: null };
}

// 更新订单状态（待处理 / 已完成）
async function updateOrderStatus(id, status) {
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) { alert("更新订单状态失败：" + error.message); return false; }
    return true;
}

/* ---------- 菜单渲染 ---------- */

function renderMenu() {
    const grid = document.getElementById("menuGrid");
    const items = currentCategory === "all"
        ? menuData
        : menuData.filter(item => item.category === currentCategory);

    if (items.length === 0) {
        grid.innerHTML = '<p class="empty-menu">这个分类还没有菜品，去「管理菜单」加一个吧~</p>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="menu-item">
            ${item.image
                ? `<div class="item-image"><img src="${item.image}" alt="${item.name}"></div>`
                : `<div class="item-emoji">${item.emoji || "🍽️"}</div>`}
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.description || ""}</div>
                <div class="item-bottom">
                    <span class="item-price">${item.price}</span>
                    <button class="add-btn" onclick="addToCart(${item.id})">+</button>
                </div>
            </div>
        </div>
    `).join("");
}

/* ---------- 购物车 ---------- */

function addToCart(id) {
    if (cart[id]) cart[id]++;
    else cart[id] = 1;
    renderCart();
}

function changeQty(id, delta) {
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
}

function renderCart() {
    const container = document.getElementById("cartItems");
    const ids = Object.keys(cart);

    if (ids.length === 0) {
        container.innerHTML = '<p class="empty-cart">还没有点菜哦~</p>';
        document.getElementById("totalPrice").textContent = "¥0.00";
        return;
    }

    let total = 0;
    container.innerHTML = ids.map(id => {
        const item = menuData.find(m => m.id === Number(id));
        const qty = cart[id];
        const subtotal = item.price * qty;
        total += subtotal;

        const icon = item.image
            ? `<img class="cart-item-thumb" src="${item.image}" alt="${item.name}">`
            : `<span class="cart-item-emoji">${item.emoji || "🍽️"}</span>`;

        return `
            <div class="cart-item">
                <div class="cart-item-left">
                    ${icon}
                    <span class="cart-item-name">${item.name}</span>
                </div>
                <div class="cart-item-right">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeQty(${id}, -1)">-</button>
                        <span class="qty-num">${qty}</span>
                        <button class="qty-btn" onclick="changeQty(${id}, 1)">+</button>
                    </div>
                    <span class="cart-item-price">¥${subtotal}</span>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("totalPrice").textContent = `¥${total.toFixed(2)}`;
}

// 下单：写入 orders 表，再显示成功弹窗
async function submitOrder() {
    const ids = Object.keys(cart);
    if (ids.length === 0) {
        alert("请先选择菜品！");
        return;
    }

    let total = 0;
    const orderItems = ids.map(id => {
        const item = menuData.find(m => m.id === Number(id));
        const qty = cart[id];
        const subtotal = item.price * qty;
        total += subtotal;
        return {
            id: Number(id),
            name: item.name,
            emoji: item.emoji || "",
            price: item.price,
            qty,
            subtotal,
        };
    });

    const orderBtn = document.getElementById("orderBtn");
    orderBtn.disabled = true;
    const originalText = orderBtn.textContent;
    orderBtn.textContent = "提交中...";

    const ok = await insertOrder(orderItems, total);

    orderBtn.disabled = false;
    orderBtn.textContent = originalText;
    if (!ok) return;

    const summaryHTML = orderItems.map(it => `<div class="order-summary-item">
        <span>${it.emoji || "🍽️"} ${it.name} x${it.qty}</span>
        <span>¥${it.subtotal}</span>
    </div>`).join("");

    document.getElementById("orderSummary").innerHTML = summaryHTML +
        `<div class="order-summary-total">
            <span>总计</span>
            <span>¥${total.toFixed(2)}</span>
        </div>`;

    document.getElementById("modalOverlay").classList.add("show");
}

// 关闭下单弹窗
function closeModal() {
    document.getElementById("modalOverlay").classList.remove("show");
    Object.keys(cart).forEach(key => delete cart[key]);
    renderCart();
}

/* ---------- 菜单管理面板 ---------- */

function openAdmin() {
    resetForm();
    renderAdminList();
    switchAdminTab("menu");
    document.getElementById("adminOverlay").classList.add("show");
}

function closeAdmin() {
    document.getElementById("adminOverlay").classList.remove("show");
}

function resetForm() {
    editingId = null;
    pendingImage = "";
    document.getElementById("dishName").value = "";
    document.getElementById("dishCategory").value = "hot";
    document.getElementById("dishPrice").value = "";
    document.getElementById("dishDesc").value = "";
    document.getElementById("dishEmoji").value = "";
    document.getElementById("dishImageInput").value = "";
    document.getElementById("formTitle").textContent = "➕ 添加新菜品";
    document.getElementById("saveDishBtn").textContent = "添加菜品";
    document.getElementById("cancelEditBtn").style.display = "none";
    updateImagePreview();
}

function updateImagePreview() {
    const preview = document.getElementById("imagePreview");
    if (pendingImage) {
        preview.innerHTML = `<img src="${pendingImage}" alt="预览">`;
    } else {
        preview.innerHTML = '<span class="no-image">未选择图片</span>';
    }
}

// 选择图片：压缩后存为 data URL，节省数据库空间
function handleImageSelect(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        alert("请选择图片文件（jpg / png 等）");
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            const maxSize = 500;
            let { width, height } = img;
            if (width > maxSize || height > maxSize) {
                if (width >= height) {
                    height = Math.round(height * maxSize / width);
                    width = maxSize;
                } else {
                    width = Math.round(width * maxSize / height);
                    height = maxSize;
                }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            pendingImage = canvas.toDataURL("image/jpeg", 0.8);
            updateImagePreview();
        };
        img.onerror = () => alert("图片读取失败，请换一张试试");
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 保存菜品（新增或编辑）
async function saveDish() {
    const name = document.getElementById("dishName").value.trim();
    const category = document.getElementById("dishCategory").value;
    const price = parseFloat(document.getElementById("dishPrice").value);
    const description = document.getElementById("dishDesc").value.trim();
    const emoji = document.getElementById("dishEmoji").value.trim();

    if (!name) { alert("请填写菜名"); return; }
    if (isNaN(price) || price < 0) { alert("请填写正确的价格"); return; }
    if (!pendingImage && !emoji) { alert("请上传一张图片，或填写一个 emoji 图标"); return; }

    const saveBtn = document.getElementById("saveDishBtn");
    saveBtn.disabled = true;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "保存中...";

    let ok;
    if (editingId !== null) {
        ok = await updateDishInDb(editingId, { name, category, price, description, emoji, image: pendingImage });
    } else {
        const newId = menuData.reduce((max, m) => Math.max(max, m.id), 0) + 1;
        ok = await insertDish({ id: newId, name, emoji, image: pendingImage, price, category, description });
    }

    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
    if (!ok) return;

    menuData = await loadMenu();
    resetForm();
    renderAdminList();
    renderMenu();
}

function editDish(id) {
    const item = menuData.find(m => m.id === id);
    if (!item) return;
    editingId = id;
    pendingImage = item.image || "";
    document.getElementById("dishName").value = item.name;
    document.getElementById("dishCategory").value = item.category;
    document.getElementById("dishPrice").value = item.price;
    document.getElementById("dishDesc").value = item.description || "";
    document.getElementById("dishEmoji").value = item.emoji || "";
    document.getElementById("dishImageInput").value = "";
    document.getElementById("formTitle").textContent = "✏️ 编辑菜品";
    document.getElementById("saveDishBtn").textContent = "保存修改";
    document.getElementById("cancelEditBtn").style.display = "inline-block";
    updateImagePreview();
    document.querySelector(".admin-body").scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteDish(id) {
    const item = menuData.find(m => m.id === id);
    if (!item) return;
    if (!confirm(`确定删除「${item.name}」吗？`)) return;

    const ok = await deleteDishFromDb(id);
    if (!ok) return;

    delete cart[id];
    if (editingId === id) resetForm();
    menuData = await loadMenu();
    renderAdminList();
    renderMenu();
    renderCart();
}

// 恢复默认菜单：清空数据库菜单表，再插入 21 道默认菜
async function resetToDefault() {
    if (!confirm("确定恢复成默认菜单吗？\n这会清空数据库里所有菜品（影响所有访客），然后重新插入 21 道默认菜品。")) return;

    const { error: delErr } = await sb.from("menu").delete().neq("id", -1);
    if (delErr) { alert("清空失败：" + delErr.message); return; }

    const { error: insErr } = await sb.from("menu").insert(defaultMenu);
    if (insErr) { alert("插入默认菜单失败：" + insErr.message); return; }

    Object.keys(cart).forEach(key => delete cart[key]);
    menuData = await loadMenu();
    resetForm();
    renderAdminList();
    renderMenu();
    renderCart();
}

function renderAdminList() {
    const list = document.getElementById("adminList");
    if (menuData.length === 0) {
        list.innerHTML = '<p class="empty-cart">还没有菜品，用上面的表单添加一个吧</p>';
        return;
    }
    const catLabel = v => (categories.find(c => c.value === v) || {}).label || v;
    list.innerHTML = menuData.map(item => `
        <div class="admin-item">
            <div class="admin-item-thumb">
                ${item.image
                    ? `<img src="${item.image}" alt="${item.name}">`
                    : `<span>${item.emoji || "🍽️"}</span>`}
            </div>
            <div class="admin-item-info">
                <div class="admin-item-name">${item.name}</div>
                <div class="admin-item-meta">${catLabel(item.category)} · ¥${item.price}</div>
            </div>
            <div class="admin-item-actions">
                <button class="admin-edit-btn" onclick="editDish(${item.id})">编辑</button>
                <button class="admin-del-btn" onclick="deleteDish(${item.id})">删除</button>
            </div>
        </div>
    `).join("");
}

/* ---------- 订单记录 ---------- */

function switchAdminTab(tab) {
    document.querySelectorAll(".admin-tab").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    document.getElementById("menuTab").style.display = tab === "menu" ? "" : "none";
    document.getElementById("ordersTab").style.display = tab === "orders" ? "" : "none";
    if (tab === "orders") renderOrders();
}

// 把任意时间转成本地的 YYYY-MM-DD，用于按天比较
function localDateStr(d) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function getFilteredOrders() {
    if (ordersFilter === "today") {
        const today = localDateStr(new Date());
        return ordersData.filter(o => localDateStr(o.created_at) === today);
    }
    if (ordersFilter === "date" && ordersDateValue) {
        return ordersData.filter(o => localDateStr(o.created_at) === ordersDateValue);
    }
    return ordersData;
}

function setOrdersFilter(f) {
    ordersFilter = f;
    if (f !== "date") {
        ordersDateValue = "";
        const picker = document.getElementById("orderDatePicker");
        if (picker) picker.value = "";
    }
    document.querySelectorAll(".orders-filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === f);
    });
    renderOrdersList();
}

function setOrdersDate(value) {
    if (!value) { setOrdersFilter("all"); return; }
    ordersFilter = "date";
    ordersDateValue = value;
    document.querySelectorAll(".orders-filter-btn").forEach(btn => btn.classList.remove("active"));
    renderOrdersList();
}

async function renderOrders() {
    const list = document.getElementById("ordersList");
    list.innerHTML = '<p class="empty-cart">加载中...</p>';
    document.getElementById("ordersStats").innerHTML = "";

    const { data, error } = await loadOrders();
    if (error) {
        list.innerHTML = `<p class="empty-cart">加载订单失败：${error.message}</p>`;
        return;
    }
    ordersData = data;
    renderOrdersList();
}

function renderOrdersList() {
    const list = document.getElementById("ordersList");
    const stats = document.getElementById("ordersStats");
    const orders = getFilteredOrders();

    const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    stats.innerHTML = `共 <b>${orders.length}</b> 单 · 营业额 <b>¥${revenue.toFixed(2)}</b>`;

    if (orders.length === 0) {
        list.innerHTML = '<p class="empty-cart">这个时间段还没有订单</p>';
        return;
    }

    list.innerHTML = orders.map(order => {
        const time = new Date(order.created_at).toLocaleString("zh-CN", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });
        const lines = (order.items || []).map(it => `
            <div class="order-line">
                <span>${it.emoji || "🍽️"} ${it.name} ×${it.qty}</span>
                <span>¥${it.subtotal}</span>
            </div>`).join("");
        const done = order.status === "done";
        return `
            <div class="order-card${done ? " order-done" : ""}">
                <div class="order-card-head">
                    <span class="order-time">${time}</span>
                    <span class="order-total">¥${Number(order.total).toFixed(2)}</span>
                </div>
                <div class="order-lines">${lines}</div>
                <div class="order-card-foot">
                    <span class="order-status ${done ? "status-done" : "status-pending"}">${done ? "已完成" : "待处理"}</span>
                    <button class="order-toggle-btn" onclick="toggleOrderDone(${order.id}, ${done})">${done ? "撤销" : "标记已完成"}</button>
                </div>
            </div>`;
    }).join("");
}

async function toggleOrderDone(id, currentlyDone) {
    const newStatus = currentlyDone ? "pending" : "done";
    const ok = await updateOrderStatus(id, newStatus);
    if (!ok) return;
    const order = ordersData.find(o => o.id === id);
    if (order) order.status = newStatus;
    renderOrdersList();
}

function exportOrders() {
    const orders = getFilteredOrders();
    if (orders.length === 0) { alert("当前没有可导出的订单"); return; }

    const rows = [["下单时间", "状态", "菜品明细", "总价"]];
    orders.forEach(o => {
        const time = new Date(o.created_at).toLocaleString("zh-CN");
        const status = o.status === "done" ? "已完成" : "待处理";
        const detail = (o.items || []).map(it => `${it.name}×${it.qty}`).join("；");
        rows.push([time, status, detail, Number(o.total).toFixed(2)]);
    });

    // 加 BOM（﻿），Excel 打开中文不乱码
    const csv = "﻿" + rows.map(r =>
        r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `订单_${localDateStr(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ---------- 初始化 ---------- */

// 分类切换
document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".category-btn.active").classList.remove("active");
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        renderMenu();
    });
});

// 启动：先显示「加载中」，再从数据库拉菜单
document.getElementById("menuGrid").innerHTML = '<p class="empty-menu">加载中...</p>';
loadMenu().then(data => {
    menuData = data;
    renderMenu();
});
