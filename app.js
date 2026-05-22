// 默认菜单数据（首次打开网页时使用）
const defaultMenu = [
    // 热菜
    { id: 1,  name: "宫保鸡丁",   emoji: "🍗", image: "", price: 38, category: "hot",    desc: "花生米配嫩滑鸡丁，香辣可口" },
    { id: 2,  name: "麻婆豆腐",   emoji: "🫕", image: "", price: 28, category: "hot",    desc: "麻辣鲜香，下饭神器" },
    { id: 3,  name: "红烧肉",     emoji: "🥩", image: "", price: 48, category: "hot",    desc: "肥而不腻，入口即化" },
    { id: 4,  name: "糖醋排骨",   emoji: "🍖", image: "", price: 52, category: "hot",    desc: "酸甜适中，外酥里嫩" },
    { id: 5,  name: "水煮鱼",     emoji: "🐟", image: "", price: 58, category: "hot",    desc: "鲜嫩鱼片，麻辣鲜香" },
    { id: 6,  name: "回锅肉",     emoji: "🥓", image: "", price: 36, category: "hot",    desc: "经典川菜，肥瘦相间" },
    // 凉菜
    { id: 7,  name: "凉拌黄瓜",   emoji: "🥒", image: "", price: 16, category: "cold",   desc: "爽脆可口，开胃小菜" },
    { id: 8,  name: "皮蛋豆腐",   emoji: "🥚", image: "", price: 18, category: "cold",   desc: "滑嫩豆腐配松花蛋" },
    { id: 9,  name: "口水鸡",     emoji: "🍗", image: "", price: 32, category: "cold",   desc: "麻辣鲜香，口水直流" },
    { id: 10, name: "凉拌木耳",   emoji: "🍄", image: "", price: 18, category: "cold",   desc: "清爽木耳，健康美味" },
    // 汤类
    { id: 11, name: "番茄蛋汤",   emoji: "🍅", image: "", price: 15, category: "soup",   desc: "经典家常汤，酸甜暖胃" },
    { id: 12, name: "紫菜蛋花汤", emoji: "🥣", image: "", price: 12, category: "soup",   desc: "清淡鲜美，营养丰富" },
    { id: 13, name: "酸辣汤",     emoji: "🥘", image: "", price: 18, category: "soup",   desc: "酸辣开胃，暖身暖心" },
    // 主食
    { id: 14, name: "米饭",       emoji: "🍚", image: "", price: 3,  category: "staple", desc: "香喷喷白米饭" },
    { id: 15, name: "炒饭",       emoji: "🍳", image: "", price: 18, category: "staple", desc: "蛋炒饭，粒粒分明" },
    { id: 16, name: "炸酱面",     emoji: "🍜", image: "", price: 22, category: "staple", desc: "老北京风味，酱香浓郁" },
    { id: 17, name: "饺子",       emoji: "🥟", image: "", price: 25, category: "staple", desc: "手工水饺，皮薄馅大" },
    // 饮品
    { id: 18, name: "柠檬水",     emoji: "🍋", image: "", price: 10, category: "drink",  desc: "清爽柠檬，冰凉解暑" },
    { id: 19, name: "酸梅汤",     emoji: "🧃", image: "", price: 8,  category: "drink",  desc: "传统酸梅汤，生津止渴" },
    { id: 20, name: "奶茶",       emoji: "🧋", image: "", price: 15, category: "drink",  desc: "丝滑奶茶，香浓醇厚" },
    { id: 21, name: "可乐",       emoji: "🥤", image: "", price: 6,  category: "drink",  desc: "冰镇可乐，快乐水" },
];

// 分类（供管理面板使用）
const categories = [
    { value: "hot",    label: "热菜" },
    { value: "cold",   label: "凉菜" },
    { value: "soup",   label: "汤类" },
    { value: "staple", label: "主食" },
    { value: "drink",  label: "饮品" },
];

const STORAGE_KEY = "foodMenuData";

// 菜单数据：优先读取浏览器本地保存的，没有就用默认菜单
let menuData = loadMenu();

// 购物车
const cart = {};

// 当前分类
let currentCategory = "all";

// 管理面板状态
let editingId = null;   // 正在编辑的菜品 id，null 表示新增
let pendingImage = "";  // 表单里待保存的图片（data URL）

/* ---------- 本地存储 ---------- */

// 从浏览器本地读取菜单
function loadMenu() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length) return parsed;
        }
    } catch (e) {
        console.warn("读取本地菜单失败，使用默认菜单", e);
    }
    return defaultMenu.map(item => ({ ...item }));
}

// 把菜单保存到浏览器本地
function saveMenu() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData));
        return true;
    } catch (e) {
        alert("保存失败：浏览器存储空间不足，图片可能太大。请换一张小一点的图片再试。");
        return false;
    }
}

/* ---------- 菜单渲染 ---------- */

// 渲染菜单
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
                <div class="item-desc">${item.desc || ""}</div>
                <div class="item-bottom">
                    <span class="item-price">${item.price}</span>
                    <button class="add-btn" onclick="addToCart(${item.id})">+</button>
                </div>
            </div>
        </div>
    `).join("");
}

/* ---------- 购物车 ---------- */

// 添加到购物车
function addToCart(id) {
    if (cart[id]) {
        cart[id]++;
    } else {
        cart[id] = 1;
    }
    renderCart();
}

// 修改数量
function changeQty(id, delta) {
    cart[id] += delta;
    if (cart[id] <= 0) {
        delete cart[id];
    }
    renderCart();
}

// 渲染购物车
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

// 下单
function submitOrder() {
    const ids = Object.keys(cart);
    if (ids.length === 0) {
        alert("请先选择菜品！");
        return;
    }

    let total = 0;
    const summaryHTML = ids.map(id => {
        const item = menuData.find(m => m.id === Number(id));
        const qty = cart[id];
        const subtotal = item.price * qty;
        total += subtotal;
        return `<div class="order-summary-item">
            <span>${item.emoji || "🍽️"} ${item.name} x${qty}</span>
            <span>¥${subtotal}</span>
        </div>`;
    }).join("");

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
    // 清空购物车
    Object.keys(cart).forEach(key => delete cart[key]);
    renderCart();
}

/* ---------- 菜单管理面板 ---------- */

// 打开管理面板
function openAdmin() {
    resetForm();
    renderAdminList();
    document.getElementById("adminOverlay").classList.add("show");
}

// 关闭管理面板
function closeAdmin() {
    document.getElementById("adminOverlay").classList.remove("show");
}

// 清空表单，回到「新增」状态
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

// 更新图片预览
function updateImagePreview() {
    const preview = document.getElementById("imagePreview");
    if (pendingImage) {
        preview.innerHTML = `<img src="${pendingImage}" alt="预览">`;
    } else {
        preview.innerHTML = '<span class="no-image">未选择图片</span>';
    }
}

// 选择图片：压缩后存为 data URL，节省浏览器存储空间
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
            // 等比缩放到最长边 500px
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
function saveDish() {
    const name = document.getElementById("dishName").value.trim();
    const category = document.getElementById("dishCategory").value;
    const price = parseFloat(document.getElementById("dishPrice").value);
    const desc = document.getElementById("dishDesc").value.trim();
    const emoji = document.getElementById("dishEmoji").value.trim();

    if (!name) { alert("请填写菜名"); return; }
    if (isNaN(price) || price < 0) { alert("请填写正确的价格"); return; }
    if (!pendingImage && !emoji) { alert("请上传一张图片，或填写一个 emoji 图标"); return; }

    if (editingId !== null) {
        // 编辑已有菜品
        const item = menuData.find(m => m.id === editingId);
        if (item) {
            item.name = name;
            item.category = category;
            item.price = price;
            item.desc = desc;
            item.emoji = emoji;
            item.image = pendingImage;
        }
    } else {
        // 新增菜品
        const newId = menuData.reduce((max, m) => Math.max(max, m.id), 0) + 1;
        menuData.push({ id: newId, name, emoji, image: pendingImage, price, category, desc });
    }

    if (!saveMenu()) return;
    resetForm();
    renderAdminList();
    renderMenu();
}

// 点击「编辑」：把菜品填入表单
function editDish(id) {
    const item = menuData.find(m => m.id === id);
    if (!item) return;
    editingId = id;
    pendingImage = item.image || "";
    document.getElementById("dishName").value = item.name;
    document.getElementById("dishCategory").value = item.category;
    document.getElementById("dishPrice").value = item.price;
    document.getElementById("dishDesc").value = item.desc || "";
    document.getElementById("dishEmoji").value = item.emoji || "";
    document.getElementById("dishImageInput").value = "";
    document.getElementById("formTitle").textContent = "✏️ 编辑菜品";
    document.getElementById("saveDishBtn").textContent = "保存修改";
    document.getElementById("cancelEditBtn").style.display = "inline-block";
    updateImagePreview();
    document.querySelector(".admin-body").scrollTo({ top: 0, behavior: "smooth" });
}

// 删除菜品
function deleteDish(id) {
    const item = menuData.find(m => m.id === id);
    if (!item) return;
    if (!confirm(`确定删除「${item.name}」吗？`)) return;
    menuData = menuData.filter(m => m.id !== id);
    delete cart[id];                 // 购物车里也一并移除
    if (editingId === id) resetForm();
    if (!saveMenu()) return;
    renderAdminList();
    renderMenu();
    renderCart();
}

// 恢复成默认菜单
function resetToDefault() {
    if (!confirm("确定恢复成默认菜单吗？你添加和修改的所有菜品都会被清空。")) return;
    menuData = defaultMenu.map(item => ({ ...item }));
    Object.keys(cart).forEach(key => delete cart[key]);
    saveMenu();
    resetForm();
    renderAdminList();
    renderMenu();
    renderCart();
}

// 渲染管理面板里的菜品列表
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

renderMenu();
