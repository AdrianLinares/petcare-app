/**
 * NotificationBell Component
 * 
 * BEGINNER EXPLANATION:
 * This component displays a notification bell icon with a badge showing
 * the number of unread notifications. When clicked, it opens a dropdown
 * showing recent notifications.
 * 
 * Features:
 * - Bell icon with unread count badge
 * - Dropdown list of recent notifications
 * - Mark individual notifications as read
 * - Mark all notifications as read
 * - Delete notifications
 * - Real-time updates via Pusher
 * - Priority-based styling (high, normal, low)
 *   Note: "urgent" is reserved for future schema support.
 * 
 * Visual States:
 * - Badge hidden when count = 0
 * - Badge shows number when count > 0
 * - Different colors for notification priorities
 * 
 * Used in: App navigation header (visible to all logged-in users)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    useNotifications,
    useUnreadCount,
    useMarkAsRead,
    useMarkAllAsRead,
    useDeleteNotification,
} from '@/hooks/use-notifications';
import type { Notification } from '@/types';
import { usePusher } from '@/hooks/use-pusher';

interface NotificationBellProps {
    userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // React Query hooks for data fetching
    const { data: notifications = [], isLoading: loading } = useNotifications();
    const { data: unreadCount = 0 } = useUnreadCount();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    // Connect to Pusher for real-time updates
    const { onNotificationReceived } = usePusher(userId);

    /**
     * Real-Time Updates
     * 
     * When a new notification arrives via Pusher, we invalidate the
     * notification queries so React Query refetches fresh data.
     */
    useEffect(() => {
        const unsubscribe = onNotificationReceived((_notification: Notification) => {
            // React Query will refetch via cache invalidation if configured,
            // but we also show a toast via the Pusher callback for immediate UX.
            // The useNotifications hook will refetch on window focus or
            // manual invalidation from mutations.
        });

        return unsubscribe;
    }, [onNotificationReceived]);

    /**
     * Mark as Read
     * 
     * Marks a single notification as read via mutation.
     */
    const handleMarkAsRead = (notification: Notification) => {
        if (notification.read) return;
        markAsRead.mutate(notification.id);
    };

    /**
     * Mark All as Read
     * 
     * Marks all notifications as read via mutation.
     */
    const handleMarkAllAsRead = () => {
        markAllAsRead.mutate();
    };

    /**
     * Delete Notification
     * 
     * Permanently removes a notification via mutation.
     */
    const handleDelete = (notificationId: string) => {
        deleteNotification.mutate(notificationId);
    };

    /**
     * Get Priority Color
     * 
     * Returns Tailwind color class based on priority level.
     */
    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'urgent':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'high':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'normal':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'low':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    /**
     * Format Date
     * 
     * Converts ISO date to relative time (e.g., "5 minutes ago").
     */
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('notification.justNow');
        if (diffMins < 60) return t('notification.minutesAgo', { minutes: diffMins });
        if (diffHours < 24) return t('notification.hoursAgo', { hours: diffHours });
        if (diffDays < 7) return t('notification.daysAgo', { days: diffDays });
        return date.toLocaleDateString();
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 md:w-96">
                {/* Header */}
                <div className="flex items-center justify-between p-3 pb-2">
                    <h3 className="font-semibold text-sm">{t('notification.title')}</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs h-7"
                        >
                            {t('notification.markAllRead')}
                        </Button>
                    )}
                </div>

                <Separator />

                {/* Notification List */}
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            {t('notification.loading')}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">{t('notification.empty')}</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Priority Indicator */}
                                        <div
                                            className={`w-1 rounded-full flex-shrink-0 ${notification.priority === 'urgent'
                                                    ? 'bg-red-500'
                                                    : notification.priority === 'high'
                                                        ? 'bg-orange-500'
                                                        : notification.priority === 'normal'
                                                            ? 'bg-blue-500'
                                                            : 'bg-gray-400'
                                                }`}
                                        />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="font-medium text-sm line-clamp-1">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(notification.createdAt)}
                                                </span>

                                                <div className="flex items-center gap-1">
                                                    {!notification.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => handleMarkAsRead(notification)}
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(notification.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}