"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, Menu, User, Moon, Sun, ShoppingCart, PhoneCall } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/shared/auth/AuthProvider';
import {
  getDashboardNotifications,
  type DashboardNotification,
} from '@/lib/dashboard-api';

interface HeaderProps {
  toggleSidebar: () => void;
}

const READ_STORAGE_KEY = 'dashboard_notifications_read';
const POLL_INTERVAL_MS = 45_000;

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleString('vi-VN');
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const saved = window.localStorage.getItem(READ_STORAGE_KEY);
      if (!saved) return [];

      const parsed = JSON.parse(saved) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        const data = await getDashboardNotifications();
        if (!mounted) return;
        setNotifications(data);
      } catch {
        if (!mounted) return;
        setNotifications([]);
      }
    };

    void loadNotifications();
    const timer = setInterval(() => {
      void loadNotifications();
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.includes(item.id)).length,
    [notifications, readIds],
  );
  const displayName = useMemo(() => {
    if (!user) return 'Admin';
    const extendedUser = user as typeof user & { fullName?: string | null };
    return user.name || extendedUser.fullName || user.email || 'Admin';
  }, [user]);
  const displayEmail = user?.email ?? '';
  const avatarInitial = useMemo(() => {
    const source = displayName || displayEmail || 'A';
    return source.trim().charAt(0).toUpperCase() || 'A';
  }, [displayEmail, displayName]);

  const markAllAsRead = () => {
    const allIds = notifications.map((item) => item.id);
    setReadIds(allIds);
  };

  const handleNotificationClick = (notification: DashboardNotification) => {
    if (!readIds.includes(notification.id)) {
      setReadIds((prev) => [...prev, notification.id]);
    }
    setIsOpen(false);
    router.push(notification.targetUrl);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden">
          <Menu size={24} />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 px-1 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          {isOpen ? (
            <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Thông báo</h3>
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    Chưa có thông báo mới
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isRead = readIds.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`w-full px-4 py-3 text-left border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 ${
                          isRead ? 'opacity-70' : 'bg-indigo-50/40 dark:bg-indigo-900/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">
                            {item.type === 'ORDER' ? (
                              <ShoppingCart size={16} />
                            ) : (
                              <PhoneCall size={16} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {item.title}
                              </p>
                              <span className="shrink-0 text-[11px] text-slate-500">
                                {formatRelativeTime(item.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {isAuthLoading ? 'Đang tải...' : displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAuthLoading ? ' ' : displayEmail}
            </p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-2 ring-white dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-slate-950">
            {isAuthLoading ? <User size={18} /> : <span className="text-sm font-semibold">{avatarInitial}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
