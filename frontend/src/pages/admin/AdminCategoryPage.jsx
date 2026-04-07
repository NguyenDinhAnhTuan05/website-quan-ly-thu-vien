import { useState, useEffect, useCallback } from "react";
import Toast from "../../components/ui/Toast";
import useToast from "../../hooks/useToast";
import AdminCategoryTable from "../../components/admin/AdminCategoryTable";
import AdminCategoryForm from "../../components/admin/AdminCategoryForm";
import categoryApi from "../../api/categoryApi";

export default function AdminCategoryPage() {
  const { toast, showToast } = useToast(3000);

  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll({ keyword, page: 0, size: 100 });
      setCategories(res.content || res || []);
    } catch {
      showToast("Không thể tải danh sách thể loại", "error");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setShowForm(true);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa thể loại này?")) return;
    try {
      await categoryApi.delete(id);
      showToast("Xóa thể loại thành công", "success");
      fetchCategories();
    } catch {
      showToast("Xóa thể loại thất bại", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, categoryForm);
        showToast("Cập nhật thể loại thành công", "success");
      } else {
        await categoryApi.create(categoryForm);
        showToast("Thêm thể loại thành công", "success");
      }
      setShowForm(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      const msg = err?.response?.data?.message || "Thao tác thất bại";
      showToast(msg, "error");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
  };

  return (
    <div>
      <Toast toast={toast} />


      {showForm && (
        <AdminCategoryForm
          editingCategory={editingCategory}
          categoryForm={categoryForm}
          setCategoryForm={setCategoryForm}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      <div className="card p-6">
        <AdminCategoryTable
          categories={categories}
          loading={loading}
          keyword={keyword}
          setKeyword={setKeyword}
          onRefresh={fetchCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>
    </div>
  );
}
