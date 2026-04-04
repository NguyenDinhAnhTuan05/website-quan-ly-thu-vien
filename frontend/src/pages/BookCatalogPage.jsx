import { useState, useEffect, useCallback } from "react";
import BookFilter from "../components/BookFilter";
import BookCard from "../components/BookCard";
import Toast from "../components/ui/Toast";
import Pagination from "../components/ui/Pagination";
import { LoadingSpinner } from "../components/ui/LoadingSkeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import bookApi from "../api/bookApi";
import borrowApi from "../api/borrowApi";
import { useAuthStore } from "../store/index";
import useToast from "../hooks/useToast";

export default function BookCatalogPage() {
  const [books, setBooks] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowingId, setBorrowingId] = useState(null);
  const { toast, showToast } = useToast();

  const [filters, setFilters] = useState({ 
    search: "", 
    categoryId: "", 
    sortBy: "publishedDate", 
    sortDir: "desc" 
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read categoryId from URL query param (e.g., /book?categoryId=5)
  useEffect(() => {
    const catId = searchParams.get("categoryId");
    if (catId) {
      setFilters((prev) => ({ ...prev, categoryId: catId }));
    }
  }, [searchParams]);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        size: itemsPerPage,
        title: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        available: true,
      };
      const res = await bookApi.getBooks(params);
      if (res && res.content) {
        setBooks(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách sách:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleBorrow = async (bookId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/book" } } });
      return;
    }
    setBorrowingId(bookId);
    try {
      await borrowApi.createBorrow({ bookIds: [bookId] });
      showToast("Tạo phiếu mượn thành công! Chờ thủ thư duyệt.");
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.message || "Tạo phiếu mượn thất bại.", "error");
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <Toast message={toast?.msg} type={toast?.type} />

      <div className="container-max px-4">
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Danh sách sách</h1>
          <p className="body text-gray-600">{totalElements.toLocaleString()} cuốn sách</p>
        </div>

        <BookFilter onFilter={handleFilter} />

        {isLoading ? (
          <LoadingSpinner />
        ) : books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrow={() => handleBorrow(book.id)}
                  disabled={borrowingId === book.id}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc để tìm những cuốn sách khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
