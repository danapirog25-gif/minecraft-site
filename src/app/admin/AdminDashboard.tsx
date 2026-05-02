"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  Check,
  CheckSquare,
  Copy,
  KeyRound,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Save,
  Search,
  Square,
  Trash2,
  Wallet,
  X
} from "lucide-react";
import {
  categoryLabels,
  categoryMeta,
  commandForNickname,
  parseCommands,
  parseOrderProducts,
  parseTextList,
  teamLabels
} from "@/lib/catalog";
import { formatHryvnias, formatTalers } from "@/lib/currency";

type AdminDashboardProps = {
  initialAuthenticated: boolean;
};

type Order = {
  id: string;
  userId: string | null;
  playerNickname: string;
  contact: string;
  email: string | null;
  products: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  monoInvoiceId: string | null;
  monoPaymentUrl: string | null;
  createdAt: string;
  paidAt: string | null;
  issuedAt: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  team: string;
  contents: string | null;
  benefits: string | null;
  itemsCommands: string;
  imageUrl: string | null;
  isActive: boolean;
};

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceTalers: string;
  category: string;
  team: string;
  contents: string;
  benefits: string;
  itemsCommands: string;
  imageUrl: string;
  isActive: boolean;
};

type StoreSettings = {
  streamActive: boolean;
};

type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  adminNote: string | null;
  orderId: string | null;
  topUpId: string | null;
  createdAt: string;
};

type CurrencyTopUp = {
  id: string;
  userId: string;
  packageId: string;
  amountTalers: number;
  amountKopiyky: number;
  status: string;
  monoInvoiceId: string | null;
  monoPaymentUrl: string | null;
  createdAt: string;
  paidAt: string | null;
};

type AdminUser = {
  id: string;
  email: string;
  minecraftNickname: string;
  contact: string | null;
  balance: number;
  role: string;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
  currencyTopUps: CurrencyTopUp[];
  walletTransactions: WalletTransaction[];
};

const emptyProductForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  priceTalers: "",
  category: "starter",
  team: "all",
  contents: "",
  benefits: "",
  itemsCommands: "",
  imageUrl: "",
  isActive: true
};

const filters = [
  { id: "all", label: "усі" },
  { id: "pending", label: "очікує видачі" },
  { id: "paid", label: "оплачені старі" },
  { id: "issued", label: "видані" },
  { id: "cancelled", label: "скасовані" },
  { id: "failed", label: "помилка оплати" }
];

const statusLabels: Record<string, string> = {
  pending: "Очікує видачі",
  paid: "Очікує видачі",
  issued: "Видано",
  cancelled: "Скасовано",
  failed: "Помилка оплати"
};

const statusClasses: Record<string, string> = {
  pending: "border-lava/30 bg-lava/10 text-orange-100",
  paid: "border-moss/30 bg-moss/10 text-acid",
  issued: "border-ward/30 bg-ward/10 text-ward",
  cancelled: "border-blood/30 bg-blood/10 text-red-100",
  failed: "border-blood/30 bg-blood/10 text-red-100"
};

export default function AdminDashboard({ initialAuthenticated }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({ streamActive: false });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [productMessage, setProductMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [walletMessage, setWalletMessage] = useState<string | null>(null);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isClearingUserHistory, setIsClearingUserHistory] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [isBatchIssuing, setIsBatchIssuing] = useState(false);
  const [issuingTopUpId, setIssuingTopUpId] = useState<string | null>(null);

  const visibleOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === selectedUserId) ?? users[0] ?? null;
  }, [selectedUserId, users]);

  const selectedOrders = useMemo(() => {
    const selected = new Set(selectedOrderIds);
    return orders.filter((order) => selected.has(order.id));
  }, [orders, selectedOrderIds]);

  function commandsForOrder(order: Order) {
    const snapshot = parseOrderProducts(order.products);
    return snapshot.flatMap((product) =>
      product.itemsCommands.map((command) => commandForNickname(command, order.playerNickname))
    );
  }

  function toggleOrderSelection(orderId: string) {
    setSelectedOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
    );
  }

  function selectUser(userId: string) {
    setSelectedUserId(userId);
    setWalletMessage(null);
    setUserActionMessage(null);
    setNewUserPassword("");
  }

  function selectAllVisibleOrders() {
    const selectableIds = visibleOrders
      .filter((order) => ["pending", "paid"].includes(order.status))
      .map((order) => order.id);
    setSelectedOrderIds(selectableIds);
  }

  async function writeClipboard(value: string) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  async function copyCommands(targetOrders: Order[]) {
    const commands = targetOrders.flatMap(commandsForOrder);
    if (!commands.length) {
      setOrderMessage("Команд для копіювання не знайдено");
      return;
    }

    await writeClipboard(commands.join("\n"));
    setOrderMessage(`Скопійовано команд: ${commands.length}`);
  }

  async function issueSelectedOrders() {
    if (!selectedOrderIds.length) {
      return;
    }

    setIsBatchIssuing(true);
    setOrderMessage(null);
    try {
      const response = await fetch("/api/admin/orders/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue",
          orderIds: selectedOrderIds
        })
      });

      const data = (await response.json()) as { updatedCount?: number; error?: string };
      if (!response.ok) {
        setOrderMessage(data.error || "Не вдалося виконати batch-видачу");
        return;
      }

      setOrderMessage(`Позначено як видано: ${data.updatedCount ?? 0}`);
      setSelectedOrderIds([]);
      await loadData(userQuery.trim());
    } finally {
      setIsBatchIssuing(false);
    }
  }

  const loadData = useCallback(async (query = "") => {
    setIsLoading(true);
    try {
      const [ordersResponse, productsResponse, settingsResponse, usersResponse] = await Promise.all([
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch(`/api/admin/users${query ? `?query=${encodeURIComponent(query)}` : ""}`, { cache: "no-store" })
      ]);

      if (ordersResponse.status === 401 || productsResponse.status === 401 || settingsResponse.status === 401 || usersResponse.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const ordersData = (await ordersResponse.json()) as { orders: Order[] };
      const productsData = (await productsResponse.json()) as { products: Product[] };
      const settingsData = (await settingsResponse.json()) as { settings: StoreSettings };
      const usersData = (await usersResponse.json()) as { users: AdminUser[] };
      setOrders(ordersData.orders ?? []);
      setProducts(productsData.products ?? []);
      setSettings(settingsData.settings ?? { streamActive: false });
      setUsers(usersData.users ?? []);
      setSelectedUserId((current) =>
        usersData.users?.some((user) => user.id === current) ? current : usersData.users?.[0]?.id ?? null
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadData();
    }
  }, [isAuthenticated, loadData]);

  useEffect(() => {
    setSelectedOrderIds((current) => current.filter((id) => orders.some((order) => order.id === id)));
  }, [orders]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setAuthError("Неправильний пароль адміністратора");
      return;
    }

    setPassword("");
    setIsAuthenticated(true);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
  }

  async function markIssued(orderId: string) {
    const response = await fetch(`/api/admin/orders/${orderId}/issue`, { method: "POST" });
    if (response.ok) {
      await loadData(userQuery.trim());
    }
  }

  async function cancelOrder(orderId: string) {
    const response = await fetch(`/api/admin/orders/${orderId}/cancel`, { method: "POST" });
    if (response.ok) {
      await loadData(userQuery.trim());
    }
  }

  async function toggleStreamActive() {
    setIsSavingSettings(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamActive: !settings.streamActive })
      });

      if (response.ok) {
        const data = (await response.json()) as { settings: StoreSettings };
        setSettings(data.settings);
      }
    } finally {
      setIsSavingSettings(false);
    }
  }

  function editProduct(product: Product) {
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceTalers: String(product.price),
      category: product.category,
      team: product.team,
      contents: parseTextList(product.contents).join("\n"),
      benefits: parseTextList(product.benefits).join("\n"),
      itemsCommands: parseCommands(product.itemsCommands).join("\n"),
      imageUrl: product.imageUrl ?? "",
      isActive: product.isActive
    });
    setProductMessage(null);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductMessage(null);

    const endpoint = productForm.id ? `/api/admin/products/${productForm.id}` : "/api/admin/products";
    const method = productForm.id ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm)
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setProductMessage(data.error || "Не вдалося зберегти товар");
      return;
    }

    setProductMessage("Товар збережено");
    setProductForm(emptyProductForm);
    await loadData(userQuery.trim());
  }

  async function toggleProduct(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive })
    });
    await loadData(userQuery.trim());
  }

  async function searchUsers(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const response = await fetch(`/api/admin/users${userQuery.trim() ? `?query=${encodeURIComponent(userQuery.trim())}` : ""}`, {
      cache: "no-store"
    });

    if (response.status === 401) {
      setIsAuthenticated(false);
      return;
    }

    const data = (await response.json()) as { users: AdminUser[] };
    setUsers(data.users ?? []);
    setSelectedUserId(data.users?.[0]?.id ?? null);
    setWalletMessage(null);
    setUserActionMessage(null);
    setNewUserPassword("");
  }

  async function adjustWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }

    setWalletMessage(null);
    const amount = Math.round(Number(walletAmount.replace(",", ".")));
    if (!Number.isFinite(amount) || amount === 0) {
      setWalletMessage("Введіть додатну або відʼємну кількість талерів");
      return;
    }

    const response = await fetch(`/api/admin/users/${selectedUser.id}/wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        reason: walletReason.trim()
      })
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setWalletMessage(data.error || "Не вдалося змінити баланс");
      return;
    }

    setWalletAmount("");
    setWalletReason("");
    setWalletMessage("Баланс оновлено");
    await loadData(userQuery.trim());
  }

  async function issueTopUp(topUpId: string) {
    setIssuingTopUpId(topUpId);
    setWalletMessage(null);

    try {
      const response = await fetch(`/api/admin/top-ups/${topUpId}/issue`, {
        method: "POST"
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setWalletMessage(data.error || "Не вдалося видати талери");
        return;
      }

      setWalletMessage("Талери видано і баланс оновлено");
      await loadData(userQuery.trim());
    } finally {
      setIssuingTopUpId(null);
    }
  }

  async function resetUserPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }

    setUserActionMessage(null);
    const password = newUserPassword.trim();
    if (password.length < 8) {
      setUserActionMessage("Новий пароль має містити мінімум 8 символів");
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setUserActionMessage(data.error || "Не вдалося оновити пароль");
        return;
      }

      setNewUserPassword("");
      setUserActionMessage("Пароль оновлено. Передай новий пароль гравцю вручну.");
      await loadData(userQuery.trim());
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function deleteSelectedUser() {
    if (!selectedUser) {
      return;
    }

    const confirmed = window.confirm(
      `Видалити акаунт ${selectedUser.minecraftNickname}? Замовлення залишаться в адмінці, але баланс, поповнення і рух талерів цього акаунта буде видалено.`
    );

    if (!confirmed) {
      return;
    }

    setUserActionMessage(null);
    setIsDeletingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE"
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setUserActionMessage(data.error || "Не вдалося видалити акаунт");
        return;
      }

      setSelectedUserId(null);
      setWalletAmount("");
      setWalletReason("");
      setNewUserPassword("");
      setUserActionMessage("Акаунт видалено");
      await loadData(userQuery.trim());
    } finally {
      setIsDeletingUser(false);
    }
  }

  async function clearSelectedUserHistory() {
    if (!selectedUser) {
      return;
    }

    const confirmed = window.confirm(
      `Очистити історію ${selectedUser.minecraftNickname}? Баланс залишиться ${formatTalers(
        selectedUser.balance
      )}, але поповнення, рух талерів і покупки зникнуть з історії акаунта. Замовлення залишаться в загальному списку адмінки.`
    );

    if (!confirmed) {
      return;
    }

    setUserActionMessage(null);
    setIsClearingUserHistory(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/history`, {
        method: "DELETE"
      });

      const data = (await response.json()) as {
        result?: {
          walletTransactions: number;
          currencyTopUps: number;
          orders: number;
        };
        error?: string;
      };

      if (!response.ok) {
        setUserActionMessage(data.error || "Не вдалося очистити історію");
        return;
      }

      const result = data.result;
      setUserActionMessage(
        result
          ? `Історію очищено: рух талерів ${result.walletTransactions}, поповнення ${result.currencyTopUps}, покупок ${result.orders}.`
          : "Історію очищено"
      );
      await loadData(userQuery.trim());
    } finally {
      setIsClearingUserHistory(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="shell grid min-h-[65vh] place-items-center py-14">
        <form onSubmit={handleLogin} className="panel pixel-corners w-full max-w-md p-6 shadow-glow">
          <p className="text-sm font-black uppercase tracking-wide text-moss">Admin access</p>
          <h1 className="mt-2 text-3xl font-black text-white">Адмін-панель</h1>
          <p className="mt-3 leading-7 text-fog/70">Введіть пароль, щоб бачити замовлення й керувати товарами.</p>
          <label className="mt-6 grid gap-2">
            <span className="text-sm font-bold text-fog/70">Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
            />
          </label>
          {authError ? <p className="mt-4 text-sm text-red-200">{authError}</p> : null}
          <button className="menu-button mt-6 w-full rounded-sm bg-moss px-5 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid">
            Увійти
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="shell py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Admin control</p>
          <h1 className="voxel-title mt-2 text-4xl font-black uppercase text-white">Замовлення та товари</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void loadData(userQuery.trim())}
            className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-3 font-bold transition hover:-translate-y-1 hover:bg-white/20"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            Оновити
          </button>
          <button
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 rounded-sm border border-blood/40 bg-blood/10 px-4 py-3 font-bold text-red-100 transition hover:-translate-y-1 hover:bg-blood/20"
          >
            <LogOut size={18} />
            Вийти
          </button>
        </div>
      </div>

      <div className={`mt-8 rounded-sm border p-5 ${settings.streamActive ? "border-moss/35 bg-moss/10" : "border-lava/35 bg-lava/10"}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className={`item-cube grid h-12 w-12 place-items-center border ${settings.streamActive ? "border-moss/30 bg-moss/10 text-acid" : "border-lava/30 bg-lava/10 text-lava"}`}>
              <Power size={24} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-fog/60">Статус стріму</p>
              <h2 className="mt-1 text-2xl font-black text-white">
                {settings.streamActive ? "Стрім активний: видача відкрита" : "Стрім ще не почався: видача очікує"}
              </h2>
              <p className="mt-2 leading-7 text-fog/70">
                Покупки працюють 24/7. Цей перемикач потрібен адміну як статус старту стріму та ручної видачі ресурсів.
              </p>
            </div>
          </div>
          <button
            onClick={() => void toggleStreamActive()}
            disabled={isSavingSettings}
            className={`menu-button inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-black uppercase transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70 ${
              settings.streamActive ? "bg-blood text-white hover:bg-red-400" : "bg-moss text-bunker hover:bg-acid"
            }`}
          >
            {isSavingSettings ? <Loader2 className="animate-spin" size={18} /> : settings.streamActive ? <Ban size={18} /> : <Power size={18} />}
            {settings.streamActive ? "Позначити стрім завершеним" : "Позначити стрім активним"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-sm border border-gold/30 bg-gold/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="item-cube grid h-12 w-12 place-items-center border border-gold/30 bg-gold/10 text-gold">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-fog/60">Ручні поповнення</p>
              <h2 className="mt-1 text-2xl font-black text-white">Перевір коментар і видай талери</h2>
              <p className="mt-2 leading-7 text-fog/70">
                Гравець має вписати в коментарі до платежу свій нік із сайту. Після перевірки платежу відкрий гравця нижче й натисни &quot;Видати талери&quot; біля потрібного поповнення.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel rounded-sm p-5">
          <div className="flex items-center gap-3">
            <Wallet className="text-gold" size={24} />
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-moss">Баланси гравців</p>
              <h2 className="text-2xl font-black text-white">Талери</h2>
            </div>
          </div>

          <form onSubmit={searchUsers} className="mt-5 flex gap-2">
            <input
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Пошук за ніком або email"
              className="min-w-0 flex-1 rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
            />
            <button className="menu-button inline-flex items-center gap-2 rounded-sm bg-moss px-4 py-3 font-black text-bunker transition hover:-translate-y-1 hover:bg-acid">
              <Search size={18} />
              Знайти
            </button>
          </form>

          <div className="mt-5 grid gap-3">
            {users.length ? (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectUser(user.id)}
                  className={`rounded-sm border p-4 text-left transition hover:border-moss/40 hover:bg-moss/10 ${
                    selectedUser?.id === user.id ? "border-moss/40 bg-moss/10" : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{user.minecraftNickname}</p>
                      <p className="mt-1 text-sm text-fog/55">{user.email}</p>
                    </div>
                    <span className="font-black text-gold">{formatTalers(user.balance)}</span>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-sm border border-white/10 bg-black/20 p-4 text-sm text-fog/55">Гравців не знайдено.</p>
            )}
          </div>
        </div>

        <div className="panel rounded-sm p-5">
          {selectedUser ? (
            <>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-moss">Гравець</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{selectedUser.minecraftNickname}</h2>
                  <p className="mt-1 text-fog/60">{selectedUser.contact || selectedUser.email}</p>
                </div>
                <div className="rounded-sm border border-gold/30 bg-gold/10 px-4 py-3 text-right">
                  <p className="text-xs font-black uppercase text-fog/50">Баланс</p>
                  <p className="mt-1 text-3xl font-black text-gold">{formatTalers(selectedUser.balance)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 md:grid-cols-2">
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase text-fog/45">Email</p>
                  <p className="mt-1 break-all text-sm font-bold text-white">{selectedUser.email}</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase text-fog/45">Контакт</p>
                  <p className="mt-1 break-all text-sm font-bold text-white">{selectedUser.contact || "Не вказано"}</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase text-fog/45">Роль</p>
                  <p className="mt-1 text-sm font-bold text-white">{selectedUser.role}</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase text-fog/45">ID акаунта</p>
                  <p className="mt-1 break-all font-mono text-xs text-fog/75">{selectedUser.id}</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase text-fog/45">Створено</p>
                  <p className="mt-1 text-sm font-bold text-white">{new Date(selectedUser.createdAt).toLocaleString("uk-UA")}</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase text-fog/45">Оновлено</p>
                  <p className="mt-1 text-sm font-bold text-white">{new Date(selectedUser.updatedAt).toLocaleString("uk-UA")}</p>
                </div>
              </div>

              <form onSubmit={adjustWallet} className="mt-6 grid gap-3 border-t border-white/10 pt-5 md:grid-cols-[0.5fr_1fr_auto]">
                <input
                  required
                  inputMode="numeric"
                  value={walletAmount}
                  onChange={(event) => setWalletAmount(event.target.value)}
                  placeholder="+50 або -25"
                  className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
                />
                <input
                  value={walletReason}
                  onChange={(event) => setWalletReason(event.target.value)}
                  placeholder="Причина для історії"
                  className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
                />
                <button className="menu-button inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-4 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-yellow-300">
                  <Save size={18} />
                  Змінити баланс
                </button>
              </form>
              {walletMessage ? <p className="mt-3 text-sm text-moss">{walletMessage}</p> : null}

              <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 xl:grid-cols-[1fr_auto_auto]">
                <form onSubmit={resetUserPassword} className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <label className="grid gap-2">
                    <span className="text-sm font-black uppercase text-fog/50">Новий пароль</span>
                    <input
                      required
                      type="text"
                      minLength={8}
                      maxLength={72}
                      value={newUserPassword}
                      onChange={(event) => setNewUserPassword(event.target.value)}
                      placeholder="Мінімум 8 символів"
                      className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
                    />
                  </label>
                  <button
                    disabled={isResettingPassword}
                    className="menu-button inline-flex items-center justify-center gap-2 self-end rounded-sm bg-moss px-4 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isResettingPassword ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
                    Скинути пароль
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => void clearSelectedUserHistory()}
                  disabled={isClearingUserHistory}
                  className="inline-flex items-center justify-center gap-2 self-end rounded-sm border border-gold/35 bg-gold/10 px-4 py-3 font-black uppercase text-gold transition hover:-translate-y-1 hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isClearingUserHistory ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  Очистити історію
                </button>

                <button
                  type="button"
                  onClick={() => void deleteSelectedUser()}
                  disabled={isDeletingUser}
                  className="inline-flex items-center justify-center gap-2 self-end rounded-sm border border-blood/40 bg-blood/10 px-4 py-3 font-black uppercase text-red-100 transition hover:-translate-y-1 hover:bg-blood/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isDeletingUser ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  Видалити акаунт
                </button>
              </div>
              {userActionMessage ? <p className="mt-3 text-sm font-bold text-acid">{userActionMessage}</p> : null}

              <div className="mt-6 grid gap-5 xl:grid-cols-2">
                <div>
                  <p className="text-sm font-black uppercase text-fog/50">Історія талерів</p>
                  <div className="mt-3 grid gap-3">
                    {selectedUser.walletTransactions.length ? (
                      selectedUser.walletTransactions.map((transaction) => (
                        <div key={transaction.id} className="rounded-sm border border-white/10 bg-black/20 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-bold text-white">{transaction.description}</p>
                            <span className={transaction.amount >= 0 ? "font-black text-acid" : "font-black text-red-100"}>
                              {transaction.amount >= 0 ? "+" : "-"}
                              {formatTalers(Math.abs(transaction.amount))}
                            </span>
                          </div>
                          {transaction.adminNote ? <p className="mt-2 text-xs text-fog/50">{transaction.adminNote}</p> : null}
                          <p className="mt-2 text-xs text-fog/45">
                            {new Date(transaction.createdAt).toLocaleString("uk-UA")} · Баланс після: {formatTalers(transaction.balanceAfter)}
                          </p>
                          <p className="mt-1 break-all font-mono text-[11px] text-fog/35">ID: {transaction.id}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-sm border border-white/10 bg-black/20 p-3 text-sm text-fog/55">Руху валюти ще немає.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-black uppercase text-fog/50">Поповнення і покупки</p>
                  <div className="mt-3 grid gap-3">
                    {selectedUser.currencyTopUps.map((topUp) => {
                      const topUpStatusLabel =
                        topUp.status === "pending" ? "Очікує ручної видачі" : topUp.status === "paid" ? "Видано" : topUp.status;
                      const canIssueTopUp = topUp.status === "pending";

                      return (
                        <div key={topUp.id} className="rounded-sm border border-white/10 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-white">Поповнення: {formatTalers(topUp.amountTalers)}</span>
                            <span className="text-sm font-black text-gold">{formatHryvnias(topUp.amountKopiyky)}</span>
                          </div>
                          <p className="mt-1 text-xs text-fog/45">
                            {topUpStatusLabel} · {new Date(topUp.createdAt).toLocaleString("uk-UA")}
                          </p>
                          <p className="mt-1 text-xs text-fog/45">
                            {topUp.paidAt ? `Видано: ${new Date(topUp.paidAt).toLocaleString("uk-UA")}` : "Ще не видано"}
                          </p>
                          {canIssueTopUp ? (
                            <button
                              type="button"
                              onClick={() => void issueTopUp(topUp.id)}
                              disabled={issuingTopUpId === topUp.id}
                              className="mt-3 inline-flex items-center gap-2 rounded-sm bg-moss px-3 py-2 text-xs font-black uppercase text-bunker transition hover:bg-acid disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {issuingTopUpId === topUp.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                              Видати талери
                            </button>
                          ) : null}
                          {topUp.monoInvoiceId ? (
                            <p className="mt-1 break-all font-mono text-[11px] text-fog/35">monoInvoiceId: {topUp.monoInvoiceId}</p>
                          ) : null}
                          {topUp.monoPaymentUrl ? (
                            <a
                              href={topUp.monoPaymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block break-all text-xs font-bold text-acid transition hover:text-white"
                            >
                              Посилання на оплату
                            </a>
                          ) : null}
                          <p className="mt-1 break-all font-mono text-[11px] text-fog/35">ID: {topUp.id}</p>
                        </div>
                      );
                    })}
                    {selectedUser.orders.map((order) => {
                      const products = parseOrderProducts(order.products);

                      return (
                        <div key={order.id} className="rounded-sm border border-white/10 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-white">
                              {products.map((product) => product.name).join(", ") || "Покупка"}
                            </span>
                            <span className="text-sm font-black text-acid">{formatTalers(order.totalAmount)}</span>
                          </div>
                          <p className="mt-1 text-xs text-fog/45">
                            {statusLabels[order.status] ?? order.status} · {new Date(order.createdAt).toLocaleString("uk-UA")}
                          </p>
                          <p className="mt-1 text-xs text-fog/45">
                            Контакт: {order.contact} {order.email ? `· ${order.email}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-fog/45">
                            Оплата: {order.paymentMethod}
                            {order.paidAt ? ` · оплачено ${new Date(order.paidAt).toLocaleString("uk-UA")}` : ""}
                            {order.issuedAt ? ` · видано ${new Date(order.issuedAt).toLocaleString("uk-UA")}` : ""}
                          </p>
                          {order.monoInvoiceId ? (
                            <p className="mt-1 break-all font-mono text-[11px] text-fog/35">monoInvoiceId: {order.monoInvoiceId}</p>
                          ) : null}
                          {order.monoPaymentUrl ? (
                            <a
                              href={order.monoPaymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block break-all text-xs font-bold text-acid transition hover:text-white"
                            >
                              Посилання на оплату
                            </a>
                          ) : null}
                          <p className="mt-1 break-all font-mono text-[11px] text-fog/35">ID: {order.id}</p>
                        </div>
                      );
                    })}
                    {!selectedUser.currencyTopUps.length && !selectedUser.orders.length ? (
                      <p className="rounded-sm border border-white/10 bg-black/20 p-3 text-sm text-fog/55">
                        Поповнень і покупок ще немає.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-fog/60">Оберіть гравця, щоб керувати балансом.</p>
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-sm px-4 py-2 text-sm font-black ${
              filter === item.id ? "bg-moss text-bunker" : "border border-white/20 bg-white/5 text-fog/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-sm border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Batch-видача</p>
          <p className="mt-1 text-sm text-fog/55">
            Обрано {selectedOrderIds.length} із {visibleOrders.length} видимих замовлень
          </p>
          {orderMessage ? <p className="mt-2 text-sm font-bold text-acid">{orderMessage}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllVisibleOrders}
            className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-fog/80 transition hover:bg-white/20 hover:text-white"
          >
            <CheckSquare size={16} />
            Обрати готові
          </button>
          <button
            type="button"
            onClick={() => setSelectedOrderIds([])}
            disabled={!selectedOrderIds.length}
            className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-fog/80 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={16} />
            Зняти вибір
          </button>
          <button
            type="button"
            onClick={() => void copyCommands(selectedOrders)}
            disabled={!selectedOrders.length}
            className="inline-flex items-center gap-2 rounded-sm border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-black text-gold transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy size={16} />
            Копіювати команди
          </button>
          <button
            type="button"
            onClick={() => void issueSelectedOrders()}
            disabled={!selectedOrderIds.length || isBatchIssuing}
            className="inline-flex items-center gap-2 rounded-sm bg-moss px-4 py-2 text-sm font-black text-bunker transition hover:bg-acid disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBatchIssuing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            Позначити виданими
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {visibleOrders.length === 0 ? (
          <div className="panel rounded-sm p-6 text-fog/60">Немає замовлень для цього фільтра.</div>
        ) : (
          visibleOrders.map((order) => {
            const snapshot = parseOrderProducts(order.products);
            const commands = commandsForOrder(order);
            const isSelected = selectedOrderIds.includes(order.id);
            const canSelect = ["pending", "paid"].includes(order.status);

            return (
              <article key={order.id} className="panel shop-card rounded-sm p-5 hover:border-moss/30">
                <div className="grid gap-4 lg:grid-cols-[auto_1.2fr_0.8fr_1.2fr]">
                  <button
                    type="button"
                    onClick={() => toggleOrderSelection(order.id)}
                    disabled={!canSelect}
                    className={`grid h-10 w-10 place-items-center rounded-sm border transition ${
                      isSelected ? "border-moss/40 bg-moss/10 text-acid" : "border-white/15 bg-white/5 text-fog/45"
                    } disabled:cursor-not-allowed disabled:opacity-35`}
                    aria-label={isSelected ? "Зняти вибір замовлення" : "Обрати замовлення"}
                  >
                    {isSelected ? <CheckSquare size={19} /> : <Square size={19} />}
                  </button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-sm border px-2.5 py-1 text-xs font-black uppercase ${statusClasses[order.status] ?? "border-white/20 bg-white/10 text-fog/70"}`}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                      <span className="text-sm text-fog/50">{new Date(order.createdAt).toLocaleString("uk-UA")}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-white">{order.playerNickname}</h2>
                    <p className="mt-1 text-fog/70">{order.contact}</p>
                    {order.email ? <p className="text-fog/50">{order.email}</p> : null}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-fog/50">Товар</p>
                    {snapshot.map((product) => (
                      <p key={product.id} className="mt-2 font-bold text-white">
                        {product.name}
                      </p>
                    ))}
                    <p className="mt-3 text-xl font-black text-acid">{formatTalers(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-fog/50">Команди видачі</p>
                    <div className="mt-2 space-y-2 rounded-sm border border-white/10 bg-black/25 p-3">
                      {commands.map((command) => (
                        <code key={command} className="block break-all text-xs leading-5 text-fog/75">
                          {command}
                        </code>
                      ))}
                      {commands.length === 0 ? <p className="text-sm text-fog/50">Команди для цього товару не знайдені.</p> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => void copyCommands([order])}
                        disabled={commands.length === 0}
                        className="inline-flex items-center gap-2 rounded-sm border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-black text-gold transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-fog/40"
                      >
                        <Copy size={16} />
                        Копіювати
                      </button>
                      <button
                        onClick={() => void markIssued(order.id)}
                        disabled={!["pending", "paid"].includes(order.status)}
                        className="inline-flex items-center gap-2 rounded-sm bg-moss px-4 py-2 text-sm font-black text-bunker transition hover:bg-acid disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-fog/40"
                      >
                        <Check size={16} />
                        Позначити як видано
                      </button>
                      <button
                        onClick={() => void cancelOrder(order.id)}
                        disabled={order.status === "issued" || order.status === "cancelled"}
                        className="inline-flex items-center gap-2 rounded-sm border border-blood/35 bg-blood/10 px-4 py-2 text-sm font-black text-red-100 transition hover:bg-blood/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-fog/40"
                      >
                        <Ban size={16} />
                        Скасувати
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={saveProduct} className="panel rounded-sm p-5">
          <div className="flex items-center gap-3">
            {productForm.id ? <Pencil className="text-moss" size={22} /> : <Plus className="text-moss" size={22} />}
            <h2 className="text-2xl font-black text-white">{productForm.id ? "Редагувати товар" : "Додати товар"}</h2>
          </div>
          <div className="mt-5 grid gap-4">
            <input
              required
              placeholder="Назва"
              value={productForm.name}
              onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
            />
            <input
              placeholder="slug, якщо треба вручну"
              value={productForm.slug}
              onChange={(event) => setProductForm((current) => ({ ...current, slug: event.target.value }))}
              className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
            />
            <textarea
              required
              placeholder="Опис"
              value={productForm.description}
              onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
            />
            <textarea
              placeholder="Склад товару або набору, кожен пункт з нового рядка"
              value={productForm.contents}
              onChange={(event) => setProductForm((current) => ({ ...current, contents: event.target.value }))}
              className="min-h-32 rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
            />
            <textarea
              placeholder="Переваги товару або набору, кожен пункт з нового рядка"
              value={productForm.benefits}
              onChange={(event) => setProductForm((current) => ({ ...current, benefits: event.target.value }))}
              className="min-h-28 rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                required
                inputMode="decimal"
                placeholder="Ціна, талери"
                value={productForm.priceTalers}
                onChange={(event) => setProductForm((current) => ({ ...current, priceTalers: event.target.value }))}
                className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
              />
              <select
                value={productForm.category}
                onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
              >
                {categoryMeta.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              <select
                value={productForm.team}
                onChange={(event) => setProductForm((current) => ({ ...current, team: event.target.value }))}
                className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
              >
                {Object.entries(teamLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              required
              placeholder="/give {nickname} iron_sword 1"
              value={productForm.itemsCommands}
              onChange={(event) => setProductForm((current) => ({ ...current, itemsCommands: event.target.value }))}
              className="min-h-32 rounded-sm border border-white/20 bg-black/30 px-4 py-3 font-mono text-sm outline-none transition focus:border-moss focus:shadow-glow"
            />
            <label className="flex items-center gap-3 text-sm text-fog/70">
              <input
                type="checkbox"
                checked={productForm.isActive}
                onChange={(event) => setProductForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              Активний товар
            </label>
          </div>
          {productMessage ? <p className="mt-4 text-sm text-moss">{productMessage}</p> : null}
          <div className="mt-5 flex gap-2">
            <button className="menu-button inline-flex items-center gap-2 rounded-sm bg-moss px-4 py-3 font-black text-bunker transition hover:-translate-y-1 hover:bg-acid">
              <Save size={18} />
              Зберегти
            </button>
            {productForm.id ? (
              <button
                type="button"
                onClick={() => setProductForm(emptyProductForm)}
                className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-4 py-3 font-bold text-fog/70 transition hover:bg-white/10"
              >
                <X size={18} />
                Скасувати
              </button>
            ) : null}
          </div>
        </form>

        <div className="panel rounded-sm p-5">
          <h2 className="text-2xl font-black text-white">Товари</h2>
          <div className="mt-5 space-y-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-sm border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-black text-white">{product.name}</h3>
                    <p className="mt-1 text-sm text-fog/50">
                      {categoryLabels[product.category] ?? product.category} · {formatTalers(product.price)} ·{" "}
                      {product.isActive ? "активний" : "вимкнений"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProduct(product)}
                      className="rounded-sm border border-white/20 px-3 py-2 text-sm font-bold hover:bg-white/10"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => void toggleProduct(product)}
                      className="rounded-sm border border-blood/30 px-3 py-2 text-sm font-bold text-red-100 hover:bg-blood/10"
                    >
                      {product.isActive ? "Вимкнути" : "Увімкнути"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
