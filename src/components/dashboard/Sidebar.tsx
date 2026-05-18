"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  FolderTree,
  FileText,
  ShoppingCart,
  Users,
  QrCode,
  PhoneCall,
  House,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LoadingLink } from '@/components/shared/routing/RouteLoadingProvider';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, toggleSidebar, isMobile }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      to: '/dashboard/products',
      icon: Package,
      label: 'Products'
    },
    {
      to: '/dashboard/categories',
      icon: FolderTree,
      label: 'Categories'
    },
    {
      to: '/dashboard/policies',
      icon: FileText,
      label: 'Policies'
    },
    {
      to: '/dashboard/blogs',
      icon: BookOpen,
      label: 'Blogs'
    },
    {
      to: '/dashboard/orders',
      icon: ShoppingCart,
      label: 'Orders'
    },
    {
      to: '/dashboard/customers',
      icon: Users,
      label: 'Customers'
    },
    {
      to: '/dashboard/consultations',
      icon: PhoneCall,
      label: 'Consultations'
    },
    {
      to: '/dashboard/home-sections',
      icon: House,
      label: 'Quản lý trang chủ'
    },
    {
      to: '/dashboard/qr-management',
      icon: QrCode,
      label: 'Quản lý mã QR'
    }
  ];

  const sidebarVariants = {
    open: {
      width: 240,
      x: 0
    },
    closed: {
      width: 70,
      x: 0
    },
    mobileOpen: {
      width: 240,
      x: 0
    },
    mobileClosed: {
      width: 240,
      x: -240
    }
  };

  const getVariant = () => {
    if (isMobile) return isOpen ? 'mobileOpen' : 'mobileClosed';
    return isOpen ? 'open' : 'closed';
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <motion.aside
        initial={false}
        animate={getVariant()}
        variants={sidebarVariants}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className={cn(
          'fixed left-0 top-0 z-30 h-screen border-r border-border bg-background transition-colors duration-300',
          isMobile ? 'shadow-2xl' : ''
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div
            className={cn(
              'flex items-center gap-2 font-bold text-xl text-indigo-600 overflow-hidden whitespace-nowrap transition-all duration-300',
              !isOpen && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'
            )}
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              H
            </div>
            <span>Heritage</span>
          </div>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col">
          <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-3">
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <LoadingLink
                    key={link.to}
                    href={link.to}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group relative',
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    <link.icon size={22} className="shrink-0" />
                    <span
                      className={cn(
                        'whitespace-nowrap overflow-hidden transition-all duration-300',
                        !isOpen && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'
                      )}
                    >
                      {link.label}
                    </span>

                    {!isOpen && !isMobile && (
                      <div className="absolute left-full ml-2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
                        {link.label}
                      </div>
                    )}
                  </LoadingLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-3">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              <Settings size={22} className="shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap overflow-hidden transition-all duration-300',
                  !isOpen && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'
                )}
              >
                Settings
              </span>
            </button>
            <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
              <LogOut size={22} className="shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap overflow-hidden transition-all duration-300',
                  !isOpen && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'
                )}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
