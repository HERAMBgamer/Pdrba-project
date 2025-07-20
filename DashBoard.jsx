// DashBoard.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Save,
  X,
  Upload,
  Calendar,
  Image,
  Video,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminMediaForm from "./AdminMediaForm";

import axios from "axios";

const DashBoard = ({
  membersData,
  onUpdateMembers,
  newsData,
  onUpdateNews,
  eventsData, // This comes from App.jsx
  onUpdateEvents, // This function updates the events in App.jsx
  galleryImages,
  onUpdateGallery,
}) => {
  const [counts, setCounts] = useState({ videoCount: 0, imageCount: 0 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'add', 'edit', 'delete'
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Local gallery data (since it's not coming from App.jsx props)
  const [galleryData, setGalleryData] = useState([]);


  // Fetch media counts from the backend


  

  // Dashboard stats - now using real-time data
  const [stats, setStats] = useState({
    totalEvents: eventsData?.length || 0,
    totalNews: newsData?.length || 0,
    totalVideos: 0,
    totalImages: 0,
    totalMembers: membersData?.length || 0,
    totalRegistrations:
      eventsData?.reduce((sum, event) => sum + (event.registrations || 0), 0) || 0,
    totalViews:
      (newsData?.reduce((sum, article) => sum + (article.views || 0), 0) || 0) +
      (galleryData?.reduce((sum, video) => sum + (video.views || 0), 0) || 0),
  });

  // 📦 Fetch total media counts
  useEffect(() => {
  const fetchMediaCounts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gallery/counts");
      setStats((prev) => ({
        ...prev,
        totalImages: res.data.imageCount,
        totalVideos: res.data.videoCount,
      }));
    } catch (err) {
      console.error("Failed to fetch media counts", err);
    }
  };

  fetchMediaCounts();
  }, []);

// 📸 Fetch actual media gallery data
  useEffect(() => {
  const fetchGalleryData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gallery");
      setGalleryData(res.data); // updates gallery images/videos
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    }
  };

  fetchGalleryData();
  }, []);


  // Sidebar navigation items
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "events", label: "Events", icon: Calendar },
    { id: "news", label: "News & Blogs", icon: FileText },
    { id: "gallery", label: "Video Gallery", icon: Video },
    { id: "members", label: "Committee Members", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Handle CRUD operations
  const handleAdd = (type) => {
    setModalType("add");
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType("edit");
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item, type) => {
    setModalType("delete");
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSave = (formData) => {
    setIsLoading(true);

    setTimeout(() => {
      if (modalType === "add") {
        // Generate new ID based on existing data
        const currentData = getCurrentData();
        const newId =
          currentData.length > 0
            ? Math.max(...currentData.map((item) => item.id)) + 1
            : 1;

        const newItem = {
          ...formData,
          id: newId,
          createdAt: new Date().toISOString().split("T")[0],
        };

        // Use the appropriate update function based on activeTab
        if (activeTab === "events" && onUpdateEvents) {
          const updatedEvents = [...eventsData, newItem];
          onUpdateEvents(updatedEvents);
        } else if (activeTab === "news" && onUpdateNews) {
          const updatedNews = [...newsData, newItem];
          onUpdateNews(updatedNews);
        } else if (activeTab === "gallery") {
          setGalleryData([...galleryData, newItem]);
        } else if (activeTab === "members" && onUpdateMembers) {
          const updatedMembers = [...membersData, newItem];
          onUpdateMembers(updatedMembers);
        }
      } else if (modalType === "edit") {
        // Update existing item
        if (activeTab === "events" && onUpdateEvents) {
          const updatedEvents = eventsData.map((item) =>
            item.id === selectedItem.id ? { ...item, ...formData } : item
          );
          onUpdateEvents(updatedEvents);
        } else if (activeTab === "news" && onUpdateNews) {
          const updatedNews = newsData.map((item) =>
            item.id === selectedItem.id ? { ...item, ...formData } : item
          );
          onUpdateNews(updatedNews);
        } else if (activeTab === "gallery") {
          setGalleryData(
            galleryData.map((item) =>
              item.id === selectedItem.id ? { ...item, ...formData } : item
            )
          );
        } else if (activeTab === "members" && onUpdateMembers) {
          const updatedMembers = membersData.map((item) =>
            item.id === selectedItem.id ? { ...item, ...formData } : item
          );
          onUpdateMembers(updatedMembers);
        }
      }

      setIsLoading(false);
      setShowModal(false);
      setSelectedItem(null);
    }, 1000);
  };

  const handleDeleteConfirm = () => {
    if (activeTab === "events" && onUpdateEvents) {
      const updatedEvents = eventsData.filter(
        (item) => item.id !== selectedItem.id
      );
      onUpdateEvents(updatedEvents);
    } else if (activeTab === "news" && onUpdateNews) {
      const updatedNews = newsData.filter(
        (item) => item.id !== selectedItem.id
      );
      onUpdateNews(updatedNews);
    } else if (activeTab === "gallery") {
      setGalleryData(galleryData.filter((item) => item.id !== selectedItem.id));
    } else if (activeTab === "members" && onUpdateMembers) {
      const updatedMembers = membersData.filter(
        (item) => item.id !== selectedItem.id
      );
      onUpdateMembers(updatedMembers);
    }
    setShowModal(false);
    setSelectedItem(null);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "events":
        return eventsData || [];
      case "news":
        return newsData || [];
      case "gallery":
        return galleryData || [];
      case "members":
        return membersData || [];
      default:
        return [];
    }
  };

  // Filter data based on search and category
  const filteredData = getCurrentData().filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      item.category === filterCategory ||
      item.status === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        className="w-64 bg-white shadow-lg border-r-4 border-orange-500"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">PDRBA</h2>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100 hover:text-orange-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md border-b-2 border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 capitalize">
                {activeTab === "dashboard" ? "Dashboard Overview" : activeTab}
              </h1>
              <p className="text-gray-600">
                {activeTab === "dashboard"
                  ? "Welcome back! Here's what's happening."
                  : `Manage your ${activeTab} - Real-time updates enabled`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-800">Admin User</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
          </div>

          {/* Real-time Stats Bar */}
          {activeTab !== "dashboard" && (
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">
                  Total {activeTab}: {getCurrentData().length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  Filtered: {filteredData.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-orange-500" />
                <span className="text-gray-600">Live Updates</span>
              </div>
            </div>
          )}
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && <DashboardOverview stats={stats} />}

          {(activeTab === "events" ||
            activeTab === "news" ||
            activeTab === "gallery" ||
            activeTab === "members") && (
            <ContentManagement
              activeTab={activeTab}
              data={filteredData}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              onAdd={() => handleAdd(activeTab)}
              onEdit={(item) => handleEdit(item, activeTab)}
              onDelete={(item) => handleDelete(item, activeTab)}
            />
          )}

          {activeTab === "settings" && <SettingsPanel />}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal
            type={modalType}
            activeTab={activeTab}
            item={selectedItem}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setSelectedItem(null);
            }}
            onDeleteConfirm={handleDeleteConfirm}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Dashboard Overview Component - Updated with real-time stats
const DashboardOverview = ({ stats }) => {
  const statCards = [
    {
      label: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      label: "News Articles",
      value: stats.totalNews,
      icon: FileText,
      color: "from-green-500 to-green-600",
      change: "+8%",
    },
    {
      label: "Videos",
      value: stats.totalVideos,
      icon: Video,
      color: "from-purple-500 to-purple-600",
      change: "+15%",
    },
    {
      label: "Committee Members",
      value: stats.totalMembers,
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      change: "+5%",
    },
    {
      label: "Total Registrations",
      value: stats.totalRegistrations,
      icon: Users,
      color: "from-orange-500 to-red-500",
      change: "+25%",
    },
    {
      label: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      color: "from-pink-500 to-pink-600",
      change: "+18%",
    },
    {
    label: "Images",
    value: stats.totalImages,
    icon: Image,
    color: "from-blue-400 to-blue-600",
    change: "+10%", // Optional: remove or dynamically calculate
    }

  ];

  return (
    <div className="space-y-6">
      {/* Real-time Update Indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="text-green-800 font-semibold">Live Dashboard</h3>
            <p className="text-green-600 text-sm">
              All statistics update automatically when you modify content
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <p className="text-green-500 text-sm font-semibold">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    index === 0
                      ? "bg-blue-500"
                      : index === 1
                      ? "bg-green-500"
                      : "bg-purple-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {`Sample activity ${index + 1} description`}
                  </p>
                  <p className="text-xs text-gray-600">{`Sample item ${
                    index + 1
                  }`}</p>
                </div>
                <span className="text-xs text-gray-500">{`Sample time ${
                  index + 1
                }`}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <button
                key={index}
                className={`p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                <span className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{`Sample Action ${
                  index + 1
                }`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Management Component - Enhanced with real-time updates
const ContentManagement = ({
  activeTab,
  data,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const getFilterOptions = () => {
    switch (activeTab) {
      case "events":
        return [
          { value: "all", label: "All Events" },
          { value: "Senior EVENT", label: "Senior Events" },
          { value: "U-17 EVENT", label: "U-17 Events" },
          { value: "CHAMPIONSHIP", label: "Championships" },
          { value: "COMMUNITY EVENT", label: "Community Events" },
          { value: "active", label: "Active" },
          { value: "draft", label: "Draft" },
          { value: "completed", label: "Completed" },
        ];
      case "news":
        return [
          { value: "all", label: "All Articles" },
          { value: "Tips", label: "Tips" },
          { value: "Tricks", label: "Tricks" },
          { value: "News", label: "News" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ];
      case "gallery":
        return [
          { value: "all", label: "All Media" },
          { value: "video", label: "Videos" },
          { value: "image", label: "Images" },
          { value: "active", label: "Active" },
          { value: "hidden", label: "Hidden" },
        ];
      case "members":
        return [
          { value: "all", label: "All Members" },
          { value: "Executive", label: "Executive" },
          { value: "Administrative", label: "Administrative" },
          { value: "Finance", label: "Finance" },
          { value: "Technical", label: "Technical" },
          { value: "Events", label: "Events" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ];
      default:
        return [{ value: "all", label: "All" }];
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white"
              >
                {getFilterOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab.slice(0, -1)}
            </button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {activeTab === "gallery"
                    ? "Media"
                    : activeTab === "members"
                    ? "Name"
                    : "Title"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {activeTab === "events"
                    ? "Date"
                    : activeTab === "news"
                    ? "Author"
                    : activeTab === "members"
                    ? "Designation"
                    : "Type"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {activeTab === "members" ? "Email" : "Category"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {activeTab === "events"
                    ? "Registrations"
                    : activeTab === "members"
                    ? "Joined Year"
                    : "Views"}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <motion.tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={
                            item.image ||
                            item.thumbnail ||
                            "https://picsum.photos/50/50"
                          }
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">
                          {item.title || item.name}
                        </p>
                        <p className="text-sm text-gray-600">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {activeTab === "events"
                      ? item.date
                      : activeTab === "news"
                      ? item.author
                      : activeTab === "members"
                      ? item.designation
                      : item.type}
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === "members" ? (
                      <span className="text-sm text-gray-600">
                        {item.email}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === "active" || item.status === "published"
                          ? "bg-green-100 text-green-800"
                          : item.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {activeTab === "events"
                      ? item.registrations || 0
                      : activeTab === "members"
                      ? item.joinedYear
                      : item.views || item.likes || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No {activeTab} found</p>
            <p className="text-sm text-gray-400">
              {searchQuery || filterCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : `Click "Add ${activeTab.slice(
                    0,
                    -1
                  )}" to create your first entry`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal Component with Enhanced Event Features
const Modal = ({
  type,
  activeTab,
  item,
  onSave,
  onClose,
  onDeleteConfirm,
  isLoading,
}) => {
  const [formData, setFormData] = useState(item || {});
  const [subheadings, setSubheadings] = useState(item?.subheadings || []);
  const [uploadedImages, setUploadedImages] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData(item);
      setSubheadings(item.subheadings || []);
    } else {
      // Initialize with defaults for new items
      const defaults = {};
      if (activeTab === "members") {
        defaults.status = "active";
        defaults.joinedYear = new Date().getFullYear().toString();
        defaults.achievements = [];
      } else if (activeTab === "news") {
        defaults.author = "PRDA Admin";
        defaults.date = new Date().toISOString().split("T")[0];
        defaults.status = "published";
      } else if (activeTab === "events") {
        defaults.status = "active";
        defaults.registrations = 0;
        defaults.date = new Date().toISOString().split("T")[0];
        defaults.location = "";
      } else if (activeTab === "gallery") {
        defaults.status = "active";
        defaults.views = 0;
        defaults.likes = 0;
      }
      setFormData(defaults);
      setSubheadings([]);
    }
  }, [item, activeTab]);

  // Enhanced image upload with drag and drop
  const handleImageUpload = (field, file) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImages((prev) => ({
        ...prev,
        [field]: imageUrl,
      }));

      if (field === "mainImage" || field === "eventImage") {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      }
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, field = "eventImage") => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleImageUpload(field, imageFile);
    }
  };

  const handleSubheadingImageUpload = (index, file) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const updatedSubheadings = [...subheadings];
      updatedSubheadings[index] = {
        ...updatedSubheadings[index],
        image: imageUrl,
      };
      setSubheadings(updatedSubheadings);
    }
  };

  const addSubheading = () => {
    const newSubheading = {
      id: Date.now(),
      title: "",
      content: "",
      image: "",
    };
    setSubheadings([...subheadings, newSubheading]);
  };

  const removeSubheading = (index) => {
    const updatedSubheadings = subheadings.filter((_, i) => i !== index);
    setSubheadings(updatedSubheadings);
  };

  const updateSubheading = (index, field, value) => {
    const updatedSubheadings = [...subheadings];
    updatedSubheadings[index] = {
      ...updatedSubheadings[index],
      [field]: value,
    };
    setSubheadings(updatedSubheadings);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "delete") {
      onDeleteConfirm();
    } else {
      let dataToSave = { ...formData };

      // For news items, include subheadings and enhanced structure
      if (activeTab === "news") {
        dataToSave = {
          ...dataToSave,
          subheadings: subheadings,
          mainTitle: formData.title || formData.mainTitle,
          author: formData.author || "PRDA Admin",
          date: formData.date || new Date().toISOString().split("T")[0],
          category: formData.category || "General",
          excerpt: formData.excerpt || "",
          content: formData.content || "",
        };
      } else if (activeTab === "events") {
        // Enhanced event data structure
        dataToSave = {
          ...dataToSave,
          views: formData.views || 0,
          status: formData.status || "active",
        };
      }

      onSave(dataToSave);
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case "events":
        return (
          <>
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Enter event title (e.g., SKATE LEGENDS COMP 2025)"
                required
              />
            </div>

            {/* Date, Status, and Registrations Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status || "active"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  required
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Registrations
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.registrations || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrations: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Custom Category Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Category *
              </label>
              <input
                type="text"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Enter custom category (e.g., Senior EVENT, U-17 EVENT, CHAMPIONSHIP, etc.)"
                required
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Quick category suggestions */}
                {[
                  "Senior EVENT",
                  "U-17 EVENT",
                  "CHAMPIONSHIP",
                  "WORKSHOP",
                  "TOURNAMENT",
                  "COMMUNITY EVENT",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, category: suggestion })
                    }
                    className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Enter event venue (e.g., PRDA Sports Complex, Central Park Arena)"
              />
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                placeholder="Describe the event, rules, eligibility, prizes, etc."
                required
              />
            </div>

            {/* Enhanced Drag & Drop Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-orange-500 bg-orange-50 scale-105"
                    : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "eventImage")}
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload("eventImage", e.target.files[0])
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {formData.image || uploadedImages.eventImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImages.eventImage || formData.image}
                      alt="Event preview"
                      className="w-32 h-24 object-cover rounded-lg border mx-auto shadow-md"
                    />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-600">
                        ✓ Image uploaded successfully
                      </p>
                      <p className="text-xs text-gray-500">
                        Click or drag to replace image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto"
                      animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Upload className="w-8 h-8 text-orange-500" />
                    </motion.div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {isDragOver
                          ? "Drop image here!"
                          : "Drag & drop your event image"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse • PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                        <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                        <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
                      </div>
                      <span className="text-xs text-gray-400">
                        Supports all image formats
                      </span>
                    </div>
                  </div>
                )}

                {/* Drag overlay */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-orange-500 bg-opacity-10 border-2 border-orange-500 rounded-xl flex items-center justify-center">
                    <div className="text-orange-600 text-lg font-semibold">
                      Drop image here!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case "news":
        return (
          <>
            {/* Main Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Title
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                required
                placeholder="Enter the main title of the article"
              />
            </div>

            {/* Author, Date, Category Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author || "PRDA Admin"}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={
                    formData.date || new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Tips">Tips</option>
                  <option value="Tricks">Tricks</option>
                  <option value="News">News</option>
                  <option value="Tutorials">Tutorials</option>
                  <option value="Community">Community</option>
                  <option value="Events">Events</option>
                </select>
              </div>
            </div>

            {/* Main Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Article Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload("mainImage", e.target.files[0])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
                {(formData.image || uploadedImages.mainImage) && (
                  <div className="mt-2">
                    <img
                      src={uploadedImages.mainImage || formData.image}
                      alt="Main article preview"
                      className="w-32 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Excerpt
              </label>
              <textarea
                value={formData.excerpt || ""}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Brief summary of the article (will be shown in cards)"
                required
              />
            </div>

            {/* Main Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Content
              </label>
              <textarea
                value={formData.content || ""}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Main content of the article"
                required
              />
            </div>

            {/* Subheadings Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Article Subheadings
                </label>
                <button
                  type="button"
                  onClick={addSubheading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Subheading
                </button>
              </div>

              {subheadings.map((subheading, index) => (
                <div
                  key={subheading.id || index}
                  className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Subheading {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeSubheading(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Subheading Title */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Subheading Title
                    </label>
                    <input
                      type="text"
                      value={subheading.title || ""}
                      onChange={(e) =>
                        updateSubheading(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                      placeholder="Enter subheading title"
                    />
                  </div>

                  {/* Subheading Content */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Subheading Content
                    </label>
                    <textarea
                      value={subheading.content || ""}
                      onChange={(e) =>
                        updateSubheading(index, "content", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                      placeholder="Enter content for this subheading"
                    />
                  </div>

                  {/* Subheading Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Subheading Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleSubheadingImageUpload(index, e.target.files[0])
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                    />
                    {subheading.image && (
                      <div className="mt-2">
                        <img
                          src={subheading.image}
                          alt={`Subheading ${index + 1} preview`}
                          className="w-24 h-18 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {subheadings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No subheadings added yet</p>
                  <p className="text-sm">
                    Click "Add Subheading" to create detailed article sections
                  </p>
                </div>
              )}
            </div>
          </>
        );

      case "gallery":
        return (
          <div>
            <h1>Hello from Gallery Form</h1>

            <AdminMediaForm />
          </div>
        );


      case "members":
        return (
          <>
            {/* Name and Designation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="e.g., President, Secretary"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Executive">Executive</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Finance">Finance</option>
                  <option value="Technical">Technical</option>
                  <option value="Events">Events</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joined Year
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2025"
                  value={formData.joinedYear || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, joinedYear: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="2023"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Brief description about the member..."
                required
              />
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                value={formData.image || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            {/* Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Achievements (Comma Separated)
              </label>
              <input
                type="text"
                value={
                  formData.achievements ? formData.achievements.join(", ") : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    achievements: e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter((item) => item),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Award 1, Award 2, Achievement 3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple achievements with commas
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {type === "add"
                ? `Add New ${activeTab.slice(0, -1)}`
                : type === "edit"
                ? `Edit ${activeTab.slice(0, -1)}`
                : `Delete ${activeTab.slice(0, -1)}`}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {type === "delete" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Are you sure?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. This will permanently delete "
                {item?.title || item?.name}".
              </p>
            </div>
          ) : (
            <div className="space-y-6">{renderFormFields()}</div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                type === "delete"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {type === "delete" ? (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {type === "add" ? "Create" : "Update"}
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Users Management Component
const UsersManagement = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Users Management</h2>
      <p className="text-gray-600">
        User management functionality will be implemented here.
      </p>
    </div>
  );
};

// Settings Panel Component
const SettingsPanel = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
      <p className="text-gray-600">
        System settings and configuration options will be available here.
      </p>
    </div>
  );
};

export default DashBoard;
