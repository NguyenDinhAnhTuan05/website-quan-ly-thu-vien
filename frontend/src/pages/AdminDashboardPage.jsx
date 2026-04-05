import { useState, useEffect, useCallback } from "react";
import Toast from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import AdminBookForm from "../components/admin/AdminBookForm";
import AdminBookTable from "../components/admin/AdminBookTable";
import AdminBorrowTable from "../components/admin/AdminBorrowTable";
import AdminUserTable from "../components/admin/AdminUserTable";
import AdminAuthorTable from "../components/admin/AdminAuthorTable";
import AdminAuthorForm from "../components/admin/AdminAuthorForm";
import AdminSubscriptionTable from "../components/admin/AdminSubscriptionTable";
import AdminSubscriptionForm from "../components/admin/AdminSubscriptionForm";
import adminApi from "../api/adminApi";
import borrowApi from "../api/borrowApi";
import categoryApi from "../api/categoryApi";
import authorApi from "../api/authorApi";
import subscriptionApi from "../api/subscriptionApi";

export default function AdminDashboardPage({ activeTab: initialTab = "books" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast, showToast } = useToast(3000);

  const [books, setBooks] = useState([]);
  const [bookKeyword, setBookKeyword] = useState("");
  const [bookLoading, setBookLoading] = useState(false);

  const [borrows, setBorrows] = useState([]);
  const [borrowStatus, setBorrowStatus] = useState("");
  const [borrowLoading, setBorrowLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [userKeyword, setUserKeyword] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [bookForm, setBookForm] = useState({
    title: "", isbn: "", description: "", coverUrl: "", quantity: 1,
    available: true, publishedDate: "", categoryIds: [], authorIds: [],
  });

  // ─── QUẢN LÝ TÁC GIẢ ────────────────────────────────────────────
  const [authorList, setAuthorList] = useState([]);
  const [authorKeyword, setAuthorKeyword] = useState("");
  const [authorLoading, setAuthorLoading] = useState(false);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [authorForm, setAuthorForm] = useState({ name: "", bio: "", avatarUrl: "" });

  // ─── QUẢN LÝ GÓI THÀNH VIÊN ─────────────────────────────────────
  const [plans, setPlans] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "", description: "", price: 0, durationDays: 30, maxBorrowBooks: 3,
  });


  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchBooks = useCallback(async () => {
    setBookLoading(true);
    try {
      const res = await adminApi.getAllBooks({ keyword: bookKeyword, page: 0, size: 50 });
      setBooks(res.content || []);
    } catch {} finally {
      setBookLoading(false);
    }
  }, [bookKeyword]);

  const fetchBorrows = useCallback(async () => {
    setBorrowLoading(true);
    try {
      const params = { page: 0, size: 50, sort: "borrowDate,desc" };
      if (borrowStatus) params.status = borrowStatus;
      const res = await borrowApi.getAllBorrows(params);
      setBorrows(res.content || []);
    } catch {} finally {
      setBorrowLoading(false);
    }
  }, [borrowStatus]);

  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = userKeyword
        ? await adminApi.searchUsers(userKeyword, { page: 0, size: 30 })
        : await adminApi.getAllUsers({ page: 0, size: 30 });
      setUsers(res.content || []);
    } catch {} finally {
      setUserLoading(false);
    }
  }, [userKeyword]);

  const fetchAuthors = useCallback(async () => {
    setAuthorLoading(true);
    try {
      const res = await authorApi.getAll({ page: 0, size: 50 });
      let list = res.content || [];
      if (authorKeyword) {
        const kw = authorKeyword.toLowerCase();
        list = list.filter((a) => a.name?.toLowerCase().includes(kw));
      }
      setAuthorList(list);
    } catch {} finally {
      setAuthorLoading(false);
    }
  }, [authorKeyword]);

  const fetchPlans = useCallback(async () => {
    setPlanLoading(true);
    try {
      const res = await subscriptionApi.getAllPlans();
      setPlans(Array.isArray(res) ? res : []);
    } catch {} finally {
      setPlanLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { if (activeTab === "borrows") fetchBorrows(); }, [fetchBorrows, activeTab]);
  useEffect(() => { if (activeTab === "users") fetchUsers(); }, [fetchUsers, activeTab]);
  useEffect(() => { if (activeTab === "authors") fetchAuthors(); }, [fetchAuthors, activeTab]);
  useEffect(() => { if (activeTab === "subscriptions") fetchPlans(); }, [fetchPlans, activeTab]);
  useEffect(() => {
    categoryApi.getAllAsList().then(setCategories).catch(() => {});
    authorApi.getAllAsList().then(setAuthors).catch(() => {});
  }, []);

  const openBookForm = (book = null) => {
    if (book) {
      setEditingBook(book);
      setBookForm({
        title: book.title, isbn: book.isbn || "", description: book.description || "",
        coverUrl: book.coverUrl || "", quantity: book.quantity, available: book.available,
        publishedDate: book.publishedDate || "", categoryIds: [], authorIds: [],
      });
    } else {
      setEditingBook(null);
      setBookForm({
        title: "", isbn: "", description: "", coverUrl: "", quantity: 1,
        available: true, publishedDate: "", categoryIds: [], authorIds: [],
      });
    }
    setShowBookForm(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.title.trim()) { showToast("Tên sách không được để trống", "error"); return; }
    try {
      if (editingBook) {
        await adminApi.updateBook(editingBook.id, bookForm);
        showToast("Cập nhật sách thành công!");
      } else {
        await adminApi.createBook(bookForm);
        showToast("Thêm sách thành công!");
      }
      setShowBookForm(false);
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi lưu sách.", "error");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Xóa sách này?")) return;
    try { await adminApi.deleteBook(id); showToast("Đã xóa sách."); fetchBooks(); }
    catch (err) { showToast(err.response?.data?.message || "Không thể xóa.", "error"); }
  };

  const handleToggleBook = async (id) => {
    try { await adminApi.toggleBookStatus(id); fetchBooks(); }
    catch { showToast("Lỗi khi thay đổi trạng thái.", "error"); }
  };

  const handleCrawl = async () => {
    const kw = window.prompt("Nhập từ khóa để cào dữ liệu Google Books:", "programming");
    if (!kw) return;
    try {
      const res = await adminApi.crawlBooks(kw);
      showToast(`Cào thành công! Đã thêm ${res.added_books_count || 0} sách.`);
      fetchBooks();
    } catch { showToast("Cào dữ liệu thất bại.", "error"); }
  };

  const handleApproveBorrow = async (id) => {
    try { await borrowApi.approveBorrow(id); showToast("Đã duyệt phiếu mượn."); fetchBorrows(); }
    catch (err) { showToast(err.response?.data?.message || "Lỗi duyệt phiếu.", "error"); }
  };

  const handleReturnBorrow = async (id) => {
    try { await borrowApi.returnBorrow(id); showToast("Đã xác nhận trả sách."); fetchBorrows(); }
    catch (err) { showToast(err.response?.data?.message || "Lỗi xác nhận trả.", "error"); }
  };

  const handleRejectBorrow = async (id) => {
    const reason = window.prompt("Lý do từ chối (tùy chọn):");
    if (reason === null) return;
    try { await borrowApi.rejectBorrow(id, reason); showToast("Đã từ chối phiếu."); fetchBorrows(); }
    catch (err) { showToast(err.response?.data?.message || "Lỗi từ chối.", "error"); }
  };

  const handleToggleUser = async (id) => {
    try { await adminApi.toggleUserStatus(id); showToast("Đã thay đổi trạng thái."); fetchUsers(); }
    catch (err) { showToast(err.response?.data?.message || "Lỗi.", "error"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Xóa user này?")) return;
    try { await adminApi.deleteUser(id); showToast("Đã xóa user."); fetchUsers(); }
    catch (err) { showToast(err.response?.data?.message || "Lỗi.", "error"); }
  };

  // ─── TÁC GIẢ HANDLERS ──────────────────────────────────────────
  const openAuthorForm = (author = null) => {
    if (author) {
      setEditingAuthor(author);
      setAuthorForm({ name: author.name || "", bio: author.bio || "", avatarUrl: author.avatarUrl || "" });
    } else {
      setEditingAuthor(null);
      setAuthorForm({ name: "", bio: "", avatarUrl: "" });
    }
    setShowAuthorForm(true);
  };

  const handleAuthorSubmit = async (e) => {
    e.preventDefault();
    if (!authorForm.name.trim()) { showToast("Tên tác giả không được để trống", "error"); return; }
    try {
      if (editingAuthor) {
        await authorApi.update(editingAuthor.id, authorForm);
        showToast("Cập nhật tác giả thành công!");
      } else {
        await authorApi.create(authorForm);
        showToast("Thêm tác giả thành công!");
      }
      setShowAuthorForm(false);
      fetchAuthors();
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi lưu tác giả.", "error");
    }
  };

  const handleDeleteAuthor = async (id) => {
    if (!window.confirm("Xóa tác giả này?")) return;
    try { await authorApi.delete(id); showToast("Đã xóa tác giả."); fetchAuthors(); }
    catch (err) { showToast(err.response?.data?.message || "Không thể xóa.", "error"); }
  };

  // ─── GÓI THÀNH VIÊN HANDLERS ────────────────────────────────────
  const openPlanForm = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name || "", description: plan.description || "",
        price: plan.price || 0, durationDays: plan.durationDays || 30,
        maxBorrowBooks: plan.maxBorrowBooks || 3,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({ name: "", description: "", price: 0, durationDays: 30, maxBorrowBooks: 3 });
    }
    setShowPlanForm(true);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!planForm.name.trim()) { showToast("Tên gói không được để trống", "error"); return; }
    try {
      if (editingPlan) {
        await subscriptionApi.updatePlan(editingPlan.id, planForm);
        showToast("Cập nhật gói thành công!");
      } else {
        await subscriptionApi.createPlan(planForm);
        showToast("Thêm gói thành công!");
      }
      setShowPlanForm(false);
      fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi lưu gói.", "error");
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Xóa gói thành viên này?")) return;
    try { await subscriptionApi.deletePlan(id); showToast("Đã xóa gói."); fetchPlans(); }
    catch (err) { showToast(err.response?.data?.message || "Không thể xóa.", "error"); }
  };

  return (
    <div>
      <Toast message={toast?.msg} type={toast?.type} />

      {activeTab === "books" && (
        <div>
          <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
            <div className="flex gap-3 flex-1 flex-wrap">
              <input
                type="text"
                value={bookKeyword}
                onChange={(e) => setBookKeyword(e.target.value)}
                placeholder="Tìm sách..."
                className="input max-w-sm"
              />
              <button onClick={fetchBooks} className="btn-outline">Tải lại</button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCrawl} className="btn-secondary">Cào Google Books</button>
              <button onClick={() => openBookForm()} className="btn-primary">Thêm sách</button>
            </div>
          </div>

          {showBookForm && (
            <AdminBookForm
              editingBook={editingBook}
              bookForm={bookForm}
              setBookForm={setBookForm}
              onSubmit={handleBookSubmit}
              onClose={() => setShowBookForm(false)}
            />
          )}

          <AdminBookTable
            books={books}
            bookLoading={bookLoading}
            onToggle={handleToggleBook}
            onEdit={openBookForm}
            onDelete={handleDeleteBook}
          />
        </div>
      )}

      {activeTab === "borrows" && (
        <AdminBorrowTable
          borrows={borrows}
          borrowLoading={borrowLoading}
          borrowStatus={borrowStatus}
          setBorrowStatus={setBorrowStatus}
          onRefresh={fetchBorrows}
          onApprove={handleApproveBorrow}
          onReject={handleRejectBorrow}
          onReturn={handleReturnBorrow}
        />
      )}

      {activeTab === "users" && (
        <AdminUserTable
          users={users}
          userLoading={userLoading}
          userKeyword={userKeyword}
          setUserKeyword={setUserKeyword}
          onRefresh={fetchUsers}
          onToggle={handleToggleUser}
          onDelete={handleDeleteUser}
        />
      )}

      {activeTab === "authors" && (
        <div>
          {showAuthorForm && (
            <AdminAuthorForm
              editingAuthor={editingAuthor}
              authorForm={authorForm}
              setAuthorForm={setAuthorForm}
              onSubmit={handleAuthorSubmit}
              onClose={() => setShowAuthorForm(false)}
            />
          )}

          <AdminAuthorTable
            authors={authorList}
            authorLoading={authorLoading}
            authorKeyword={authorKeyword}
            setAuthorKeyword={setAuthorKeyword}
            onRefresh={fetchAuthors}
            onEdit={openAuthorForm}
            onDelete={handleDeleteAuthor}
            onAdd={() => openAuthorForm()}
          />
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div>
          {showPlanForm && (
            <AdminSubscriptionForm
              editingPlan={editingPlan}
              planForm={planForm}
              setPlanForm={setPlanForm}
              onSubmit={handlePlanSubmit}
              onClose={() => setShowPlanForm(false)}
            />
          )}

          <AdminSubscriptionTable
            plans={plans}
            planLoading={planLoading}
            onEdit={openPlanForm}
            onDelete={handleDeletePlan}
            onAdd={() => openPlanForm()}
            onRefresh={fetchPlans}
          />
        </div>
      )}
    </div>
  );
}
