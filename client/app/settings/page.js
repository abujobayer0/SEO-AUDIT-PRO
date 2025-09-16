"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import ShinyText from "../../components/ShinyText";
import StarBorder from "../../components/StarBorder";
import Link from "next/link";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    brandColor: "#3B82F6",
    logoUrl: "",
    subscription: "free",
    email: "",
  });
  const [stats, setStats] = useState({
    websitesTracked: 0,
    reportsGenerated: 0,
    lastActivity: null,
  });
  const [usage, setUsage] = useState({ currentMonth: 0, maxMonthly: 0, remaining: 0, subscription: "", subscriptionExpires: null });

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUserData();
    fetchUserStats();
    fetchUsage();
  }, []);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get("/users/profile");
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        companyName: userData.companyName || "",
        brandColor: userData.brandColor || "#3B82F6",
        logoUrl: userData.logoUrl || "",
        subscription: userData.subscription || "free",
        email: userData.email || "",
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/users/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await api.get("/users/usage");
      if (response?.data?.usage) setUsage(response.data.usage);
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate logo URL if provided
      if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
        toast.error("Please enter a valid logo URL");
        setSaving(false);
        return;
      }

      const response = await api.put("/users/profile", formData);
      setUser(response.data.user);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black'>
      {/* Header - match landing/dashboard style */}
      <header className='bg-black/30 backdrop-blur-md w-[90%] rounded-full absolute shadow-xl border border-white/10 top-4 left-1/2 transform -translate-x-1/2 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-3'>
            <Link href={"/"}>
              <div className='flex items-center'>
                <BarChart3 className='h-6 w-6 text-white' />
                <span className='ml-2 text-xl font-bold text-white'>Seo Inspect Pro</span>
              </div>
            </Link>
            <div className='flex items-center space-x-4'>
              <StarBorder
                as='button'
                onClick={() => router.push("/dashboard")}
                color='rgba(255, 255, 255, 0.4)'
                thickness={1}
                className='px-4 py-2'
              >
                Dashboard
              </StarBorder>
              <StarBorder as='button' onClick={logout} color='rgba(255, 255, 255, 0.6)' thickness={1} className='px-4 py-2'>
                <LogOut className='h-4 w-4 mr-2' />
                Logout
              </StarBorder>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='pt-24'>
          <div className='px-6 py-4 border-b border-white/10'>
            <h1 className='text-2xl font-bold text-white'>
              Account <ShinyText text='Settings' className='font-bold' speed={7} />
            </h1>
            <p className='text-gray-100'>Manage your account preferences and branding</p>
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Settings Form */}
              <div className='lg:col-span-2'>
                <form onSubmit={handleSave} className='space-y-6'>
                  {/* Basic Information */}
                  <div>
                    <h3 className='text-lg font-medium text-white mb-4'>Basic Information</h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-100 mb-2'>Email</label>
                        <input
                          type='email'
                          name='email'
                          value={formData.email}
                          disabled
                          className='w-full px-3 py-2 border border-white/20 rounded-md bg-black/50 text-gray-300 backdrop-blur-sm'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-100 mb-2'>Company Name</label>
                        <input
                          type='text'
                          name='companyName'
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm'
                          placeholder='Your Company Name'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branding */}
                  <div>
                    <h3 className='text-lg font-medium text-white mb-4'>Branding</h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-100 mb-2'>Logo URL</label>
                        <input
                          type='url'
                          name='logoUrl'
                          value={formData.logoUrl}
                          onChange={handleInputChange}
                          className='w-full bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm'
                          placeholder='https://example.com/logo.png'
                        />
                        <p className='text-sm text-gray-300 mt-1'>Enter a direct link to your logo image (PNG, JPG, or SVG)</p>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-100 mb-2'>Brand Color</label>
                        <div className='flex items-center space-x-2'>
                          <input
                            type='color'
                            name='brandColor'
                            value={formData.brandColor}
                            onChange={handleInputChange}
                            className='h-10 w-20 border border-white/20 rounded cursor-pointer bg-transparent'
                          />
                          <input
                            type='text'
                            value={formData.brandColor}
                            onChange={(e) => setFormData((prev) => ({ ...prev, brandColor: e.target.value }))}
                            className='flex-1 bg-gray-900/30 border border-white/20 focus:border-white text-white rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg backdrop-blur-sm'
                            placeholder='#FFFFFF'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo Preview */}
                    {formData.logoUrl && (
                      <div className='mt-4'>
                        <label className='block text-sm font-medium text-gray-100 mb-2'>Logo Preview</label>
                        <div className='border border-white/10 rounded-lg p-4 bg-black/20 backdrop-blur-sm'>
                          <img
                            src={formData.logoUrl}
                            alt='Logo Preview'
                            className='max-h-20 max-w-40 object-contain'
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display = "block";
                            }}
                          />
                          <div className='text-red-500 text-sm hidden'>Failed to load logo. Please check the URL.</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subscription */}
                  <div>
                    <h3 className='text-lg font-medium text-white mb-4'>Subscription</h3>
                    <div className='bg-black/20 border border-white/10 p-4 rounded-lg backdrop-blur-sm'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium text-white capitalize'>{formData.subscription} Plan</p>
                          <p className='text-sm text-gray-300'>{`Used ${usage.currentMonth} of ${usage.maxMonthly} scans this month`}</p>
                        </div>
                        {formData.subscription === "free" && (
                          <StarBorder as='button' type='button' color='rgba(255, 255, 255, 0.6)' thickness={1} className='px-4 py-2'>
                            <ShinyText text='Upgrade' speed={5} />
                          </StarBorder>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className='flex justify-end'>
                    <StarBorder
                      as='button'
                      type='submit'
                      disabled={saving}
                      color='rgba(255, 255, 255, 0.6)'
                      thickness={1}
                      className='px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </StarBorder>
                  </div>
                </form>
              </div>

              {/* Statistics Sidebar */}
              <div className='space-y-6'>
                <div className='bg-black/20 border border-white/10 p-6 rounded-lg backdrop-blur-sm'>
                  <h3 className='text-lg font-medium text-white mb-4'>
                    <ShinyText text='Account Statistics' speed={6} />
                  </h3>

                  <div className='space-y-4'>
                    <div>
                      <p className='text-sm text-gray-300'>Websites Tracked</p>
                      <p className='text-2xl font-bold text-white'>{stats.websitesTracked}</p>
                    </div>

                    <div>
                      <p className='text-sm text-gray-300'>Reports Generated</p>
                      <p className='text-2xl font-bold text-white'>{stats.reportsGenerated}</p>
                    </div>

                    <div>
                      <p className='text-sm text-gray-300'>Last Activity</p>
                      <p className='text-sm text-gray-100'>
                        {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brand Preview */}
                <div className='bg-black/20 border border-white/10 p-6 rounded-lg backdrop-blur-sm'>
                  <h3 className='text-lg font-medium text-white mb-4'>Brand Preview</h3>
                  <div className='p-4 rounded-lg text-white' style={{ backgroundColor: formData.brandColor }}>
                    <div className='flex items-center space-x-3'>
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt='Logo' className='h-8 w-8 object-contain bg-white rounded p-1' />
                      ) : (
                        <div className='h-8 w-8 bg-white rounded flex items-center justify-center'>
                          <span className='text-xs' style={{ color: formData.brandColor }}>
                            LOGO
                          </span>
                        </div>
                      )}
                      <span className='font-semibold'>{formData.companyName || "Your Company"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
