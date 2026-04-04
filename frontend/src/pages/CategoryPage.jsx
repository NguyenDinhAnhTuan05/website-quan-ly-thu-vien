import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import categoryApi from "../api/categoryApi";
import seriesApi from "../api/seriesApi";
import { LoadingSpinner } from "../components/ui/LoadingSkeleton";
import { BookOpen, Library, ChevronRight, Layers } from "lucide-react";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catRes, seriesRes] = await Promise.all([
          categoryApi.getAllAsList(),
          seriesApi.getAllSeries(),
        ]);
        setCategories(Array.isArray(catRes) ? catRes : catRes?.content || []);
        setSeriesList(Array.isArray(seriesRes) ? seriesRes : []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryColors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-purple-500 to-pink-600",
    "from-cyan-500 to-blue-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-red-600",
    "from-violet-500 to-purple-600",
  ];

  const categoryIcons = ["📚", "🔬", "🎭", "💻", "🌍", "🎨", "📖", "🧪", "🎵", "⚽", "🏛️", "💡"];

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-max px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-max px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="heading-1 mb-2 flex items-center gap-3">
            <Library className="w-8 h-8 text-primary-600" />
            Thể loại & Bộ sách
          </h1>
          <p className="body text-gray-600">
            Khám phá sách theo thể loại hoặc theo bộ sách yêu thích
          </p>
        </div>

        {/* Categories Section */}
        <section className="mb-14">
          <h2 className="heading-2 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            Thể loại ({categories.length})
          </h2>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/book?categoryId=${cat.id}`)}
                  className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} opacity-90`}></div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="text-3xl mb-3">
                      {categoryIcons[index % categoryIcons.length]}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-white/80 text-sm line-clamp-2">{cat.description}</p>
                    )}
                    <div className="mt-3 flex items-center text-white/90 text-sm font-medium">
                      Xem sách <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có thể loại nào.</p>
            </div>
          )}
        </section>

        {/* Series Section */}
        <section>
          <h2 className="heading-2 mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-accent-600" />
            Bộ sách ({seriesList.length})
          </h2>

          {seriesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {seriesList.map((series) => (
                <Link
                  key={series.id}
                  to={`/series/${series.id}`}
                  className="group relative card bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Layers className="w-7 h-7 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 truncate">
                          {series.name}
                        </h3>
                        {series.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{series.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                            {series.bookCount} cuốn
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                      Xem chi tiết <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có bộ sách nào.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
