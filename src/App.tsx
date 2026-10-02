import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Building2,
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  RefreshCw,
  Clock,
  BarChart2,
  TrendingUp,
  Search,
  Compass,
} from "lucide-react";

interface User {
  email: string;
  password?: string;
  name: string;
  role: string;
}

interface Representative {
  id: number;
  name: string;
  email: string;
  phone: string;
  area: string;
}

interface Client {
  id: number;
  name: string;
  owner: string;
  address: string;
  phone: string;
  district: string;
  status: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  salePrice: number;
  purchasePrice: number;
}

interface Visit {
  id: number;
  repName: string;
  clientName: string;
  date: string;
  time: string;
  sales: number;
  purchaseCost?: number;
  comment: string;
  payment: string;
}

interface Product {
  id: number;
  name: string;
  quantity: number;
  salePrice: number;
  purchasePrice: number;
}

const BIN_ID = "6abf2a88ac6210605a0b257b";
const API_KEY = "$2a$10$2ePkX8MqA2K/.icytiDHROr2HTb53TPXugC3qu5RnQE9UEmXMR43a";

const BUILT_IN_USERS: User[] = [
  {
    email: "begalinovtim@mail.ru",
    password: "admin",
    name: "Тимур Бегалинов",
    role: "admin",
  },
  {
    email: "arman@trade.kz",
    password: "123",
    name: "Арман",
    role: "representative",
  },
  {
    email: "aibek@trade.kz",
    password: "123",
    name: "Айбек",
    role: "representative",
  },
];

const normalizeUsers = (users: User[]): User[] => {
  const withoutBuiltIns = users.filter(
    (user) =>
      !BUILT_IN_USERS.some(
        (builtIn) => user.email?.toLowerCase() === builtIn.email.toLowerCase(),
      ),
  );
  return [...BUILT_IN_USERS, ...withoutBuiltIns];
};

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem("tc_v5_users");
      if (saved) return normalizeUsers(JSON.parse(saved));
    } catch (e) {}
    return BUILT_IN_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem("tc_v5_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("orders");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedReportDate, setSelectedReportDate] = useState<string>("");
  const [selectedFinanceDate, setSelectedFinanceDate] = useState<string>("");

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedOrderDate, setSelectedOrderDate] = useState<string>(todayStr);
  const [selectedRepOrderDate, setSelectedRepOrderDate] = useState<string>(todayStr);

  const [representatives, setRepresentatives] = useState<Representative[]>(
    () => {
      try {
        const saved = localStorage.getItem("tc_v5_reps");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [
        {
          id: 1,
          name: "Арман",
          email: "arman@trade.kz",
          phone: "+7 (701) 123-45-67",
          area: "Центр",
        },
        {
          id: 2,
          name: "Айбек",
          email: "aibek@trade.kz",
          phone: "+7 (702) 987-65-43",
          area: "Жилгородок",
        },
      ];
    },
  );

  const [newRepName, setNewRepName] = useState("");
  const [newRepEmail, setNewRepEmail] = useState("");
  const [newRepPhone, setNewRepPhone] = useState("");
  const [newRepArea, setNewRepArea] = useState("");

  const [districts, setDistricts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tc_v5_districts");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      "Центр",
      "Жилгородок",
      "Минское шоссе",
      "Старый город",
      "Юго-Запад",
    ];
  });
  const [newDistrictName, setNewDistrictName] = useState("");

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem("tc_v5_clients");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 1,
        name: "Магазин «Ансар»",
        owner: "Арман",
        address: "пр. Алии Молдагуловой, 50",
        phone: "+7 (701) 555-11-22",
        district: "Центр",
        status: "Активен",
      },
      {
        id: 2,
        name: "Супермаркет «Динар»",
        owner: "Айбек",
        address: "ул. Санкибай батыра, 20",
        phone: "+7 (702) 444-33-11",
        district: "Жилгородок",
        status: "Активен",
      },
    ];
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    try {
      const saved = localStorage.getItem("tc_v5_visits");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("tc_v5_products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [visitClient, setVisitClient] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductForAdd, setSelectedProductForAdd] = useState<number>(0);
  const [itemQty, setItemQty] = useState("0");
  const [visitPayment, setVisitPayment] = useState("Оплачен");

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientDistrict, setClientDistrict] = useState(districts[0] || "Центр");

  const [prodName, setProdName] = useState("");
  const [prodQty, setProdQty] = useState("");
  const [prodSalePrice, setProdSalePrice] = useState("");
  const [prodPurchasePrice, setProdPurchasePrice] = useState("");

  useEffect(() => {
    if (products.length > 0 && (selectedProductForAdd === 0 || !products.some(p => p.id === selectedProductForAdd))) {
      setSelectedProductForAdd(products[0].id);
    }
  }, [products]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.overscrollBehaviorY = "none";
  }, []);

  const handleManualSync = async () => {
    try {
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
        {
          headers: { "X-Master-Key": API_KEY },
        },
      );
      if (response.ok) {
        const json = await response.json();
        const cloudData = json.record;
        if (cloudData) {
          if (cloudData.products) {
            setProducts(cloudData.products);
            localStorage.setItem("tc_v5_products", JSON.stringify(cloudData.products));
          }
          if (cloudData.visits) {
            setVisits(cloudData.visits);
            localStorage.setItem("tc_v5_visits", JSON.stringify(cloudData.visits));
          }
          if (cloudData.clients) {
            setClients(cloudData.clients);
            localStorage.setItem("tc_v5_clients", JSON.stringify(cloudData.clients));
          }
          if (cloudData.reps) {
            setRepresentatives(cloudData.reps);
            localStorage.setItem("tc_v5_reps", JSON.stringify(cloudData.reps));
          }
          if (Array.isArray(cloudData.users)) {
            const normalizedUsers = normalizeUsers(cloudData.users);
            setUsersList(normalizedUsers);
            localStorage.setItem("tc_v5_users", JSON.stringify(normalizedUsers));
          }
          if (cloudData.districts) {
            setDistricts(cloudData.districts);
            localStorage.setItem("tc_v5_districts", JSON.stringify(cloudData.districts));
          }
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    const initApp = async () => {
      await handleManualSync();
      setTimeout(() => {
        setIsInitializing(false);
      }, 1500);
    };
    initApp();
  }, []);

  const commitToStorage = (
    newProd: Product[],
    newVis: Visit[],
    newCli: Client[],
    newRep: Representative[],
    newUsr: User[],
    newDist: string[],
  ) => {
    try {
      localStorage.setItem("tc_v5_products", JSON.stringify(newProd));
      localStorage.setItem("tc_v5_visits", JSON.stringify(newVis));
      localStorage.setItem("tc_v5_clients", JSON.stringify(newCli));
      localStorage.setItem("tc_v5_reps", JSON.stringify(newRep));
      localStorage.setItem("tc_v5_users", JSON.stringify(newUsr));
      localStorage.setItem("tc_v5_districts", JSON.stringify(newDist));

      setProducts(newProd);
      setVisits(newVis);
      setClients(newCli);
      setRepresentatives(newRep);
      setUsersList(newUsr);
      setDistricts(newDist);

      fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify({
          products: newProd,
          visits: newVis,
          clients: newCli,
          reps: newRep,
          users: newUsr,
          districts: newDist,
        }),
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("tc_v5_current_user", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("tc_v5_current_user");
    }
  }, [currentUser]);

  const handleClearMonthOrders = () => {
    if (window.confirm("Вы уверены, что хотите очистить все накопленные заказы за месяц? Это действие обнулит общие суммы продаж.")) {
      commitToStorage(products, [], clients, representatives, usersList, districts);
      setSuccessMessage("Месячные продажи успешно сброшены!");
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = usersList.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        u.password === loginPassword.trim(),
    );

    if (found) {
      const loggedUser = {
        email: found.email,
        name: found.name,
        role: found.role,
      };
      setCurrentUser(loggedUser);
      sessionStorage.setItem("tc_v5_current_user", JSON.stringify(loggedUser));
      setLoginError("");
      setActiveTab("orders");
    } else {
      setLoginError("Неверный email или пароль.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("tc_v5_current_user");
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !currentUser) return;

    const newClient: Client = {
      id: Date.now(),
      name: clientName.trim(),
      owner: currentUser.name,
      address: clientAddress.trim() || "Адрес не указан",
      phone: clientPhone.trim() || "Телефон не указан",
      district: clientDistrict || "Центр",
      status: "Активен",
    };

    const updatedClients = [newClient, ...clients];
    commitToStorage(products, visits, updatedClients, representatives, usersList, districts);

    setClientName("");
    setClientAddress("");
    setClientPhone("");
    setSuccessMessage("Магазин успешно добавлен!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleDeleteClient = (id: number) => {
    if (!currentUser) return;
    const clientToDel = clients.find((c) => c.id === id);
    if (currentUser.role !== "admin" && clientToDel?.owner !== currentUser.name)
      return;

    const updated = clients.filter((c) => c.id !== id);
    commitToStorage(products, visits, updated, representatives, usersList, districts);
    setSuccessMessage("Клиент удален.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleAddDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName.trim() || districts.includes(newDistrictName.trim()))
      return;
    const updated = [...districts, newDistrictName.trim()];
    commitToStorage(products, visits, clients, representatives, usersList, updated);
    setNewDistrictName("");
    setSuccessMessage("Район добавлен!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteDistrict = (dist: string) => {
    const updated = districts.filter((d) => d !== dist);
    commitToStorage(products, visits, clients, representatives, usersList, updated);
  };

  const handleAddItemToOrder = () => {
    const targetId = selectedProductForAdd || (products[0] ? products[0].id : 0);
    const prod = products.find((p) => p.id === targetId);
    if (!prod) {
      setSuccessMessage("Выберите товар!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    const q = Number(itemQty) || 0;
    if (q <= 0) {
      setSuccessMessage("Укажите количество больше 0!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    if (prod.quantity < q) {
      setSuccessMessage(`На складе осталось только ${prod.quantity} шт. этого товара!`);
      setTimeout(() => setSuccessMessage(""), 4000);
      return;
    }

    const existingIdx = orderItems.findIndex((i) => i.productId === prod.id);
    if (existingIdx > -1) {
      const updated = [...orderItems];
      updated[existingIdx].quantity += q;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: q,
          salePrice: prod.salePrice,
          purchasePrice: prod.purchasePrice || 0,
        },
      ]);
    }
    setItemQty("0");
  };

  const handleRemoveOrderItem = (productId: number) => {
    setOrderItems(orderItems.filter((i) => i.productId !== productId));
  };

  const handleCheckoutOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!visitClient) {
      setSuccessMessage("Ошибка: выберите клиента (торговую точку)!");
      setTimeout(() => setSuccessMessage(""), 4000);
      return;
    }
    if (orderItems.length === 0) {
      setSuccessMessage("Ошибка: добавьте хотя бы один товар в заказ!");
      setTimeout(() => setSuccessMessage(""), 4000);
      return;
    }

    let updatedProducts = [...products];
    let totalSales = 0;
    let totalPurchaseCost = 0;
    let commentParts: string[] = [];

    for (const item of orderItems) {
      const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIdx > -1) {
        updatedProducts[prodIdx].quantity = Math.max(
          0,
          updatedProducts[prodIdx].quantity - item.quantity,
        );
      }
      totalSales += item.salePrice * item.quantity;
      totalPurchaseCost += item.purchasePrice * item.quantity;
      commentParts.push(`${item.productName} (${item.quantity} шт.)`);
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newVisit: Visit = {
      id: Date.now(),
      repName: currentUser.name,
      clientName: visitClient,
      date: dateStr,
      time: timeStr,
      sales: totalSales,
      purchaseCost: totalPurchaseCost,
      comment: commentParts.join(", "),
      payment: visitPayment,
    };

    const updatedVisits = [newVisit, ...visits];

    commitToStorage(updatedProducts, updatedVisits, clients, representatives, usersList, districts);

    setOrderItems([]);
    setVisitClient("");
    setClientSearch("");
    setSuccessMessage(`Заказ на сумму ${totalSales.toLocaleString()} ₸ успешно создан! Успешных продаж!`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleDeleteOrder = (id: number) => {
    if (!currentUser || currentUser.role !== "admin") return;
    const updated = visits.filter((v) => v.id !== id);
    commitToStorage(products, updated, clients, representatives, usersList, districts);
    setSuccessMessage("Заказ удален.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || currentUser?.role !== "admin") return;

    const newProd: Product = {
      id: Date.now(),
      name: prodName.trim(),
      quantity: Number(prodQty) || 0,
      salePrice: Number(prodSalePrice) || 0,
      purchasePrice: Number(prodPurchasePrice) || 0,
    };

    const updatedProducts = [newProd, ...products];
    commitToStorage(updatedProducts, visits, clients, representatives, usersList, districts);

    setProdName("");
    setProdQty("");
    setProdSalePrice("");
    setProdPurchasePrice("");
    setSuccessMessage("Товар добавлен на склад!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleDeleteProduct = (id: number) => {
    if (!currentUser || currentUser.role !== "admin") return;
    const updated = products.filter((p) => p.id !== id);
    commitToStorage(updated, visits, clients, representatives, usersList, districts);
    setSuccessMessage("Товар удален.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleAddRepresentative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "admin" || !newRepName.trim() || !newRepEmail.trim())
      return;

    const email = newRepEmail.trim().toLowerCase();
    const newRep: Representative = {
      id: Date.now(),
      name: newRepName.trim(),
      email: email,
      phone: newRepPhone.trim() || "+7 (700) 000-00-00",
      area: newRepArea.trim() || "Общий сектор",
    };

    const updatedReps = [newRep, ...representatives];
    const updatedUsers = [
      ...usersList,
      {
        email: email,
        password: "123",
        name: newRepName.trim(),
        role: "representative",
      },
    ];

    commitToStorage(products, visits, clients, updatedReps, updatedUsers, districts);

    setNewRepName("");
    setNewRepEmail("");
    setNewRepPhone("");
    setNewRepArea("");
    setSuccessMessage("Агент успешно зарегистрирован!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleDeleteRepresentative = (id: number) => {
    if (!currentUser || currentUser.role !== "admin") return;
    const repToDelete = representatives.find((r) => r.id === id);
    let updatedUsers = usersList;
    if (repToDelete) {
      updatedUsers = usersList.filter((u) => u.email !== repToDelete.email);
    }
    const updatedReps = representatives.filter((r) => r.id !== id);

    const updatedClients = clients.map((c) => {
      if (repToDelete && c.owner === repToDelete.name) {
        return { ...c, owner: "Общая база (архив)" };
      }
      return c;
    });

    commitToStorage(products, visits, updatedClients, updatedReps, updatedUsers, districts);
    setSuccessMessage("Агент удален.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Экран приветствия при запуске
  if (isInitializing) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white font-sans px-4 select-none">
        <div className="bg-emerald-600 p-6 rounded-3xl shadow-2xl mb-5 animate-pulse">
          <span className="text-4xl font-black">ТК</span>
        </div>
        <h1 className="text-3xl font-black tracking-wide">Торговый Контроль</h1>
        <p className="text-emerald-300 text-base mt-2 font-medium tracking-wide">
          Добро пожаловать! Успешных продаж!
        </p>
        <div className="mt-8 flex items-center space-x-2 text-xs text-emerald-400">
          <RefreshCw className="animate-spin" size={16} />
          <span>Подготовка системы...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-slate-950 font-sans px-4 select-none overflow-hidden"
        style={{ overscrollBehaviorY: "none", touchAction: "pan-x pan-y" }}
      >
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800">
          <div className="text-center mb-6">
            <div className="inline-block bg-emerald-600 text-white font-black text-xl p-3.5 rounded-2xl mb-3 shadow-lg">
              ТК
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Торговый Контроль
            </h1>
            <p className="text-xs text-emerald-600 mt-1 font-bold">
              Добро пожаловать! Успешных продаж!
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs mb-4 font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Введите ваш email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                placeholder="Введите пароль"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3.5 transition text-sm shadow-lg shadow-emerald-600/30"
            >
              Войти в систему
            </button>
          </form>
        </div>
      </div>
    );
  }

  const myClients =
    currentUser.role === "admin"
      ? clients
      : clients.filter(
          (c) =>
            c.owner === currentUser.name || c.owner === "Общая база (архив)",
        );

  return (
    <div
      className="fixed inset-0 flex flex-col md:flex-row bg-slate-100 text-slate-800 font-sans overflow-hidden select-none"
      style={{ overscrollBehaviorY: "none", touchAction: "pan-x pan-y" }}
    >
      {/* Боковая панель ПК */}
      <aside className="hidden md:flex w-72 bg-emerald-950 text-slate-100 flex-col justify-between shadow-2xl shrink-0 z-30">
        <div>
          <div className="p-6 border-b border-emerald-900 flex items-center space-x-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white font-black text-lg">
              ТК
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">
                Торговый Контроль
              </h1>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {currentUser.role === "admin"
                  ? "👑 Администратор"
                  : `📱 Агент: ${currentUser.name}`}
              </span>
            </div>
          </div>

          <div className="px-4 py-3 text-[11px] uppercase tracking-wider text-emerald-500 font-bold">
            Навигация
          </div>

          <nav className="px-3 space-y-1.5">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                activeTab === "orders"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <FileText size={18} />
              <span>
                {currentUser.role === "admin"
                  ? "Все заказы компании"
                  : "Мои продажи"}
              </span>
            </button>

            {currentUser.role !== "admin" && (
              <button
                onClick={() => setActiveTab("create_order")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                  activeTab === "create_order"
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-emerald-900 hover:text-white"
                }`}
              >
                <Plus size={18} />
                <span>Создать заказ</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("clients")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                activeTab === "clients"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <Building2 size={18} />
              <span>
                {currentUser.role === "admin"
                  ? "Все клиенты"
                  : "Мои клиенты и ТТ"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                activeTab === "products"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <Package size={18} />
              <span>
                {currentUser.role === "admin"
                  ? "Движение товара (Склад)"
                  : "Остатки товаров"}
              </span>
            </button>

            {currentUser.role === "admin" && (
              <>
                <button
                  onClick={() => setActiveTab("finance")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                    activeTab === "finance"
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-emerald-900 hover:text-white"
                  }`}
                >
                  <DollarSign size={18} />
                  <span>Финансы и Агенты</span>
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                    activeTab === "reports"
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-emerald-900 hover:text-white"
                  }`}
                >
                  <BarChart2 size={18} />
                  <span>Отчеты и Маржа</span>
                </button>

                <button
                  onClick={() => setActiveTab("admin_panel")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                    activeTab === "admin_panel"
                      ? "bg-amber-600 text-white shadow-lg"
                      : "text-amber-400 hover:bg-emerald-900 hover:text-white"
                  }`}
                >
                  <Shield size={18} />
                  <span>Управление кадрами</span>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-emerald-900 bg-emerald-950/90 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-slate-200 truncate">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-emerald-400 truncate font-semibold">
              Успешных продаж!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-emerald-900 hover:bg-rose-950 text-rose-300 px-3 py-1.5 rounded-lg transition shrink-0"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Основная рабочая область с отступом снизу (pb-72) */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-72 md:pb-6">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-xs shrink-0">
          <div>
            <span className="text-[11px] md:text-xs text-emerald-600 font-bold uppercase tracking-wider block">
              {currentUser.role === "admin"
                ? "👑 Администратор"
                : `📱 Агент: ${currentUser.name}`}
            </span>
            <h2 className="text-base md:text-xl font-black text-slate-900 mt-0.5">
              Торговый Контроль • Успешных продаж!
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleManualSync}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 text-xs font-bold shadow-md"
              title="Обновить данные из облака"
            >
              <RefreshCw size={16} />
              <span>Обновить из сети</span>
            </button>

            <button
              onClick={handleLogout}
              className="md:hidden bg-rose-50 text-rose-600 border border-rose-200 text-xs px-3 py-1.5 rounded-lg font-bold"
            >
              Выйти
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm">
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
              <span className="font-medium text-sm">{successMessage}</span>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">
                    {currentUser.role === "admin"
                      ? "Журнал всех заказов компании"
                      : "Мои продажи и заказы"}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500">
                    {currentUser.role === "admin"
                      ? `Всего заказов в облаке: ${visits.length}`
                      : `Всего ваших заказов: ${visits.filter(v => v.repName === currentUser.name).length}`}
                  </p>
                </div>
                {currentUser.role === "admin" && (
                  <button
                    onClick={handleClearMonthOrders}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Сбросить продажи за месяц</span>
                  </button>
                )}
                {currentUser.role !== "admin" && (
                  <button
                    onClick={() => setActiveTab("create_order")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 w-full md:w-auto justify-center"
                  >
                    <Plus size={16} />
                    <span>Создать заказ</span>
                  </button>
                )}
              </div>

              {currentUser.role === "admin" ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                        📦
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">
                          Продано товара за день
                        </p>
                        <p className="text-lg font-black text-emerald-600">
                          {visits
                            .filter(
                              (v) =>
                                !selectedOrderDate ||
                                v.date === selectedOrderDate,
                            )
                            .reduce((totalUnits, v) => {
                              const matches = v.comment
                                ? v.comment.matchAll(/\((\d+)\s*шт\./g)
                                : [];
                              let sum = 0;
                              for (const m of matches) {
                                sum += parseInt(m[1], 10);
                              }
                              return totalUnits + sum;
                            }, 0)}{" "}
                          шт.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between pt-3 border-t border-slate-100 gap-3">
                    <span className="text-xs font-bold text-slate-600">
                      Просмотр по датам (прошлые дни):
                    </span>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <input
                        type="date"
                        value={selectedOrderDate}
                        onChange={(e) => setSelectedOrderDate(e.target.value)}
                        className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium w-full md:w-auto"
                      />
                      {selectedOrderDate && (
                        <button
                          onClick={() => setSelectedOrderDate("")}
                          className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition shrink-0"
                        >
                          Все дни
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                        💰
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-emerald-800 uppercase">
                          Ваша выручка за выбранный день
                        </p>
                        <p className="text-xl font-black text-emerald-700">
                          {visits
                            .filter(
                              (v) =>
                                v.repName === currentUser.name &&
                                (!selectedRepOrderDate || v.date === selectedRepOrderDate)
                            )
                            .reduce((sum, v) => sum + v.sales, 0)
                            .toLocaleString()}{" "}
                          ₸
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between pt-3 border-t border-slate-100 gap-3">
                    <span className="text-xs font-bold text-slate-600">
                      Выбрать день продаж:
                    </span>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <input
                        type="date"
                        value={selectedRepOrderDate}
                        onChange={(e) => setSelectedRepOrderDate(e.target.value)}
                        className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium w-full md:w-auto"
                      />
                      {selectedRepOrderDate && (
                        <button
                          onClick={() => setSelectedRepOrderDate("")}
                          className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl transition shrink-0"
                        >
                          Все дни
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {visits.filter((v) =>
                  currentUser.role === "admin"
                    ? !selectedOrderDate || v.date === selectedOrderDate
                    : v.repName === currentUser.name && (!selectedRepOrderDate || v.date === selectedRepOrderDate),
                ).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm font-medium">
                    Заказов за этот день не найдено. Удачных продаж!
                  </div>
                ) : (
                  visits
                    .filter((v) =>
                      currentUser.role === "admin"
                        ? !selectedOrderDate || v.date === selectedOrderDate
                        : v.repName === currentUser.name && (!selectedRepOrderDate || v.date === selectedRepOrderDate),
                    )
                    .map((visit) => (
                      <div
                        key={visit.id}
                        className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                            <Clock size={18} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm md:text-base">
                                {visit.clientName}
                              </h4>
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                                Агент: {visit.repName}
                              </span>
                            </div>
                            <p className="text-[11px] md:text-xs text-slate-500 pt-0.5">
                              {visit.comment}
                            </p>
                            <p className="text-[10px] md:text-[11px] text-slate-400 pt-1 flex items-center space-x-1">
                              <span>📅 {visit.date}</span>
                              {visit.time && <span>• ⏰ {visit.time}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right shrink-0">
                            <p className="text-xs md:text-sm font-black text-emerald-600">
                              +{visit.sales.toLocaleString()} ₸
                            </p>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${visit.payment === "Оплачен" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                            >
                              {visit.payment}
                            </span>
                          </div>
                          {currentUser.role === "admin" && (
                            <button
                              onClick={() => handleDeleteOrder(visit.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                              title="Удалить заказ"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === "create_order" && currentUser.role !== "admin" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">
                    Создание заказа
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500">
                    Выберите свой магазин и добавьте товары со склада. Успешных продаж!
                  </p>
                </div>
                <button
                  onClick={handleManualSync}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1.5"
                >
                  <RefreshCw size={14} className="text-emerald-600" />
                  <span>Обновить</span>
                </button>
              </div>

              <form
                onSubmit={handleCheckoutOrder}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
              >
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ваш клиент (ТТ)*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Начните вводить название вашего магазина..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setIsClientDropdownOpen(true);
                        if (!e.target.value) setVisitClient("");
                      }}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 bg-white"
                    />
                    <Search
                      className="absolute left-3.5 top-3.5 text-slate-400"
                      size={18}
                    />
                  </div>

                  {isClientDropdownOpen && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {myClients.filter((c) =>
                        c.name
                          .toLowerCase()
                          .includes(clientSearch.toLowerCase()),
                      ).length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center">
                          У вас нет таких магазинов. Добавьте их во вкладке
                          «Клиенты».
                        </div>
                      ) : (
                        myClients
                          .filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(clientSearch.toLowerCase()),
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setVisitClient(c.name);
                                setClientSearch(c.name);
                                setIsClientDropdownOpen(false);
                              }}
                              className="p-3 text-sm hover:bg-emerald-50 cursor-pointer font-medium text-slate-800 transition"
                            >
                              {c.name}{" "}
                              <span className="text-xs text-slate-400">
                                ({c.district} — {c.address})
                              </span>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Добавить товары со склада
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Товар
                      </label>
                      <select
                        value={selectedProductForAdd}
                        onChange={(e) =>
                          setSelectedProductForAdd(Number(e.target.value))
                        }
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 bg-white text-sm focus:outline-none focus:border-emerald-600"
                      >
                        {products.length === 0 ? (
                          <option value="0">Склад пуст</option>
                        ) : (
                          products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {p.salePrice} ₸ (Остаток: {p.quantity}{" "}
                              шт)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Количество (нажмите +/- или введите)
                      </label>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(itemQty, 10) || 0;
                            if (current > 0) setItemQty(String(current - 1));
                          }}
                          className="w-10 h-10 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-lg flex items-center justify-center transition shrink-0"
                        >
                          –
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={itemQty}
                          onChange={(e) => setItemQty(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl py-2.5 text-center text-slate-900 text-sm font-bold focus:outline-none focus:border-emerald-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(itemQty, 10) || 0;
                            setItemQty(String(current + 1));
                          }}
                          className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg flex items-center justify-center transition shrink-0 shadow-md"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={handleAddItemToOrder}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shrink-0 shadow-md"
                        >
                          Добавить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    Состав заказа:
                  </label>
                  {orderItems.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
                      Товары еще не добавлены. Укажите количество и нажмите «Добавить».
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                      {orderItems.map((item) => (
                        <div
                          key={item.productId}
                          className="p-3 flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              {item.productName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.quantity} шт. × {item.salePrice} ₸ ={" "}
                              <b className="text-emerald-600">
                                {(
                                  item.quantity * item.salePrice
                                ).toLocaleString()}{" "}
                                ₸
                              </b>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveOrderItem(item.productId)
                            }
                            className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">
                    Итоговая сумма заказа:
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    {orderItems
                      .reduce((sum, i) => sum + i.salePrice * i.quantity, 0)
                      .toLocaleString()}{" "}
                    ₸
                  </span>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setVisitPayment("Оплачен")}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition border ${visitPayment === "Оплачен" ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                  >
                    Оплата сразу
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitPayment("В долг")}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition border ${visitPayment === "В долг" ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                  >
                    В долг
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3.5 transition text-sm shadow-lg shadow-emerald-600/30"
                >
                  ОТПРАВИТЬ ЗАКАЗ В ОБЛАКО
                </button>
              </form>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  {currentUser.role === "admin"
                    ? "Все клиенты компании"
                    : "Мои клиенты и торговые точки"}
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  {currentUser.role === "admin"
                    ? "База всех магазинов, добавленных агентами с указанием районов."
                    : "Магазины, которые вы добавили сами с выбором района."}
                </p>
              </div>

              <form
                onSubmit={handleAddClient}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <h4 className="font-bold text-slate-900 text-sm">
                  Добавить новый магазин
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Название магазина / ТТ*
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Магазин «Айгерим»"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Район / Пункт*
                  </label>
                  <select
                    value={clientDistrict}
                    onChange={(e) => setClientDistrict(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 bg-white text-sm focus:outline-none focus:border-emerald-600"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Адрес
                  </label>
                  <input
                    type="text"
                    placeholder="Улица, дом"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Телефон
                  </label>
                  <input
                    type="text"
                    placeholder="+7 (...)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 transition text-sm shadow-md"
                >
                  Сохранить магазин
                </button>
              </form>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {myClients.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    У вас пока нет добавленных магазинов.
                  </div>
                ) : (
                  myClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {client.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            📍 Район:{" "}
                            <b className="text-emerald-600">{client.district}</b>{" "}
                            • {client.address} • {client.phone}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Агент: {client.owner}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  {currentUser.role === "admin"
                    ? "Управление складом и товарами"
                    : "Остатки товаров на складе"}
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  {currentUser.role === "admin"
                    ? "Добавление позиций и контроль остатков."
                    : "Актуальные остатки товаров для оформления заказов."}
                </p>
              </div>

              {currentUser.role === "admin" && (
                <form
                  onSubmit={handleAddProduct}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <h4 className="font-bold text-slate-900 text-sm">
                    Новый товар на склад
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Название товара*
                      </label>
                      <input
                        type="text"
                        placeholder="Например: Напиток 0.5л"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Количество (шт)*
                      </label>
                      <input
                        type="number"
                        placeholder="100"
                        value={prodQty}
                        onChange={(e) => setProdQty(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Цена продажи (₸)*
                      </label>
                      <input
                        type="number"
                        placeholder="500"
                        value={prodSalePrice}
                        onChange={(e) => setProdSalePrice(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Закупочная цена (₸)
                      </label>
                      <input
                        type="number"
                        placeholder="350"
                        value={prodPurchasePrice}
                        onChange={(e) => setProdPurchasePrice(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 transition text-sm shadow-md"
                  >
                    Добавить товар на склад
                  </button>
                </form>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm font-medium">
                    Склад пуст.
                  </div>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                          <Package size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {product.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Остаток:{" "}
                            <b className="text-emerald-600">
                              {product.quantity} шт.
                            </b>{" "}
                            • Цена продажи: {product.salePrice} ₸
                            {currentUser.role === "admin" &&
                            product.purchasePrice
                              ? ` • Закуп: ${product.purchasePrice} ₸`
                              : ""}
                          </p>
                        </div>
                      </div>
                      {currentUser.role === "admin" && (
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "finance" && currentUser.role === "admin" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">
                    Финансы и вклад каждого агента
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500">
                    Узнайте, кто сколько принес денег в компанию по дням.
                  </p>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <input
                    type="date"
                    value={selectedFinanceDate}
                    onChange={(e) => setSelectedFinanceDate(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 bg-white font-medium w-full md:w-auto"
                  />
                  {selectedFinanceDate && (
                    <button
                      onClick={() => setSelectedFinanceDate("")}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl transition shrink-0"
                    >
                      Все дни
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Касса за выбранный день / период
                    </p>
                    <p className="text-2xl font-black text-emerald-600 mt-2">
                      {visits
                        .filter(
                          (v) =>
                            !selectedFinanceDate ||
                            v.date === selectedFinanceDate,
                        )
                        .reduce((acc, v) => acc + v.sales, 0)
                        .toLocaleString()}{" "}
                      ₸
                    </p>
                  </div>
                  <button
                    onClick={handleClearMonthOrders}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold transition border border-rose-200"
                  >
                    Сбросить месяц
                  </button>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Заказов за день / период
                  </p>
                  <p className="text-2xl font-black text-emerald-600 mt-2">
                    {
                      visits.filter(
                        (v) =>
                          !selectedFinanceDate ||
                          v.date === selectedFinanceDate,
                      ).length
                    }{" "}
                    шт.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-base">
                  Выручка и проданные товары по агентам
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {representatives.map((rep) => {
                    const repVisits = visits.filter(
                      (v) =>
                        v.repName === rep.name &&
                        (!selectedFinanceDate ||
                          v.date === selectedFinanceDate),
                    );
                    const repTotal = repVisits.reduce(
                      (sum, v) => sum + v.sales,
                      0,
                    );
                    const repProfit = repVisits.reduce(
                      (sum, v) => sum + (v.sales - (v.purchaseCost || 0)),
                      0,
                    );
                    const repUnits = repVisits.reduce((totalUnits, v) => {
                      const matches = v.comment
                        ? v.comment.matchAll(/\((\d+)\s*шт\./g)
                        : [];
                      let sum = 0;
                      for (const m of matches) {
                        sum += parseInt(m[1], 10);
                      }
                      return totalUnits + sum;
                    }, 0);

                    return (
                      <div
                        key={rep.id}
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            👤
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {rep.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {rep.area}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                          <span className="text-xs text-slate-500">
                            Продаж:
                          </span>
                          <span className="font-black text-emerald-600 text-sm">
                            {repTotal.toLocaleString()} ₸
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">
                            Продано товара:
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            {repUnits} шт.
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Маржа:</span>
                          <span className="font-bold text-emerald-600 text-xs">
                            +{repProfit.toLocaleString()} ₸
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && currentUser.role === "admin" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">
                    Отчеты и Маржа по дням
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500">
                    Аналитика выручки, чистой прибыли и по дням
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <input
                    type="date"
                    value={selectedReportDate}
                    onChange={(e) => setSelectedReportDate(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 bg-white font-medium w-full md:w-auto"
                  />
                  {selectedReportDate && (
                    <button
                      onClick={() => setSelectedReportDate("")}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2.5 rounded-xl transition shrink-0"
                    >
                      Все дни
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-800">
                    Заказов за выбранный день
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    {
                      visits.filter((v) =>
                        selectedReportDate
                          ? v.date === selectedReportDate
                          : true,
                      ).length
                    }
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Общая сумма продаж
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {visits
                        .filter((v) =>
                          selectedReportDate
                            ? v.date === selectedReportDate
                            : true,
                        )
                        .reduce((acc, v) => acc + v.sales, 0)
                        .toLocaleString()}{" "}
                      ₸
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Чистая прибыль (Маржа)
                    </p>
                    <p className="text-xl font-black text-emerald-600 mt-1 flex items-center space-x-1">
                      <TrendingUp size={18} />
                      <span>
                        {(() => {
                          const filtered = visits.filter((v) =>
                            selectedReportDate
                              ? v.date === selectedReportDate
                              : true,
                          );
                          const totalSales = filtered.reduce(
                            (acc, v) => acc + v.sales,
                            0,
                          );
                          const totalCost = filtered.reduce(
                            (acc, v) => acc + (v.purchaseCost || 0),
                            0,
                          );
                          return (totalSales - totalCost).toLocaleString();
                        })()}{" "}
                        ₸
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Продано товаров
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {visits
                        .filter((v) =>
                          selectedReportDate
                            ? v.date === selectedReportDate
                            : true,
                        )
                        .reduce((totalUnits, v) => {
                          const matches = v.comment
                            ? v.comment.matchAll(/\((\d+)\s*шт\./g)
                            : [];
                          let sum = 0;
                          for (const m of matches) {
                            sum += parseInt(m[1], 10);
                          }
                          return totalUnits + sum;
                        }, 0)}{" "}
                      шт
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-base">
                  Список операций за день
                </h4>
                {visits.filter((v) =>
                  selectedReportDate ? v.date === selectedReportDate : true,
                ).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    Операций за этот день нет.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {visits
                      .filter((v) =>
                        selectedReportDate
                          ? v.date === selectedReportDate
                          : true,
                      )
                      .map((v) => {
                        const profit = v.sales - (v.purchaseCost || 0);
                        return (
                          <div
                            key={v.id}
                            className="py-3.5 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-slate-900 text-sm">
                                {v.sales.toLocaleString()} ₸
                              </p>
                              <p className="text-xs text-slate-500">
                                Товар: {v.comment}
                              </p>
                              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                Чистая прибыль: +{profit.toLocaleString()} ₸
                              </p>
                              <p className="text-[10px] text-emerald-700 font-semibold">
                                ТТ: {v.clientName} ({v.repName})
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-500">
                                {v.date}
                              </span>
                              <span
                                className={`block text-[10px] font-bold mt-0.5 ${v.payment === "Оплачен" ? "text-emerald-600" : "text-rose-600"}`}
                              >
                                {v.payment}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "admin_panel" && currentUser.role === "admin" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  Управление кадрами и Районами
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  Регистрация агентов и добавление пунктов (районов).
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Compass size={18} className="text-emerald-600" />
                  <span>Справочник районов (пунктов доставки)</span>
                </h4>

                <form onSubmit={handleAddDistrict} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Название нового района..."
                    value={newDistrictName}
                    onChange={(e) => setNewDistrictName(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md"
                  >
                    Добавить район
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {districts.map((d) => (
                    <div
                      key={d}
                      className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs font-bold text-emerald-700"
                    >
                      <span>{d}</span>
                      {districts.length > 1 && (
                        <button
                          onClick={() => handleDeleteDistrict(d)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleAddRepresentative}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <h4 className="font-bold text-slate-900 text-sm">
                  Добавить торгового агента
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Имя агента*
                  </label>
                  <input
                    type="text"
                    placeholder="Имя"
                    value={newRepName}
                    onChange={(e) => setNewRepName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email (логин для входа)*
                  </label>
                  <input
                    type="email"
                    placeholder="agent@trade.kz"
                    value={newRepEmail}
                    onChange={(e) => setNewRepEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Телефон
                  </label>
                  <input
                    type="text"
                    placeholder="+7 (...)"
                    value={newRepPhone}
                    onChange={(e) => setNewRepPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl py-3 transition text-sm shadow-md"
                >
                  Зарегистрировать агента (Пароль по умолчанию: 123)
                </button>
              </form>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {representatives.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                        <Shield size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {rep.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {rep.email} • {rep.phone}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRepresentative(rep.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      title="Удалить агента"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* НИЖНЯЯ МОБИЛЬНАЯ НАВИГАЦИЯ */}
      <nav className="md:hidden fixed bottom-16 left-3 right-3 bg-emerald-950/95 backdrop-blur-md border border-emerald-700/80 shadow-2xl rounded-2xl px-3 py-3.5 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium ${activeTab === "orders" ? "text-emerald-400 scale-105" : "text-slate-400"}`}
        >
          <FileText size={22} />
          <span className="text-[10px] mt-1 font-bold">Продажи</span>
        </button>

        {currentUser.role !== "admin" && (
          <button
            onClick={() => setActiveTab("create_order")}
            className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium ${activeTab === "create_order" ? "text-emerald-400 scale-105" : "text-slate-400"}`}
          >
            <Plus size={22} />
            <span className="text-[10px] mt-1 font-bold">Создать</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("products")}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium ${activeTab === "products" ? "text-emerald-400 scale-105" : "text-slate-400"}`}
        >
          <Package size={22} />
          <span className="text-[10px] mt-1 font-bold">Товары</span>
        </button>

        {currentUser.role === "admin" ? (
          <>
            <button
              onClick={() => setActiveTab("finance")}
              className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium ${activeTab === "finance" ? "text-emerald-400 scale-105" : "text-slate-400"}`}
            >
              <DollarSign size={22} />
              <span className="text-[10px] mt-1 font-bold">Финансы</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium ${activeTab === "reports" ? "text-emerald-400 scale-105" : "text-slate-400"}`}
            >
              <BarChart2 size={22} />
              <span className="text-[10px] mt-1 font-bold">Отчеты</span>
            </button>
            <button
              onClick={() => setActiveTab("admin_panel")}
              className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium ${activeTab === "admin_panel" ? "text-amber-400 scale-105" : "text-slate-400"}`}
            >
              <Shield size={22} />
              <span className="text-[10px] mt-1 font-bold">Агенты</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium ${activeTab === "clients" ? "text-emerald-400 scale-105" : "text-slate-400"}`}
          >
            <Building2 size={22} />
            <span className="text-[10px] mt-1 font-bold">Клиенты</span>
          </button>
        )}
      </nav>
    </div>
  );
}