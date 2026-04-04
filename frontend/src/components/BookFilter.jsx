import { useState, useEffect } from "react";
import categoryApi from "../api/categoryApi";

export default function BookFilter({ onFilter }) {
  const [filters, setFilters] = useState({ 
    search: "", 
    categoryId: "", 
    sortBy: "publishedDate", 
    sortDir: "desc" 
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryApi.getAllAsList()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilter?.(updated);
  };

  const handleClear = () => {
    const cleared = { search: "", categoryId: "", sortBy: "publishedDate", sortDir: "desc" };
    setFilters(cleared);
    onFilter?.(cleared);
  };

  const hasFilters = filters.search || filters.categoryId;

  return (
    <div className="card p-6 mb-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Tìm kiếm & Lọc</h2>
        {hasFilters && (
          <button 
            onClick={handleClear} 
            className="text-sm text-gray-500 hover:text-danger-600 transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-5">
          <input 
            type="text" 
            name="search" 
            placeholder="Tìm theo tên sách, ISBN..." 
            value={filters.search} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>

        {/* Category */}
        <div className="md:col-span-3">
          <select 
            name="categoryId" 
            value={filters.categoryId} 
            onChange={handleChange}
            className="select w-full"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="md:col-span-2">
          <select 
            name="sortBy" 
            value={filters.sortBy} 
            onChange={handleChange}
            className="select w-full"
          >
            <option value="publishedDate">Mới nhất</option>
            <option value="title">Tên (A-Z)</option>
            <option value="availableQuantity">Còn nhiều nhất</option>
            <option value="createdAt">Vừa thêm</option>
          </select>
        </div>

        {/* Sort Direction */}
        <div className="md:col-span-2">
          <select 
            name="sortDir" 
            value={filters.sortDir} 
            onChange={handleChange}
            className="select w-full"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </div>
    </div>
  );
}
