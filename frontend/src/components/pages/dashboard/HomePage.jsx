import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2, ClipboardList, CheckCircle2, AlertTriangle, Users, BarChart, CalendarClock, History } from 'lucide-react';
import { Bar, BarChart as ReBarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import { getDashboardData } from '@/services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatDate = (dateString) => {
    if (!dateString) {
        return 'Tidak ada deadline';
    }
    try {
        return format(new Date(dateString), "d MMMM yyyy", { locale: id });
    } catch (e) {
        return 'Tanggal tidak valid';
    }
};


const PIE_CHART_COLORS = {
    selesai: '#22c55e',          
    sedang_dikerjakan: '#f97316', 
    belum_dimulai: '#ef4444',      
};

export default function HomePage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDashboardData();
                setDashboardData(response);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full"><p className="text-red-500">{error}</p></div>;
    }

    const taskSummaryForPie = Object.entries(dashboardData.task_summary)
        .filter(([key]) => key !== 'total')
        .map(([name, value]) => ({
            name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value,
        }));
    
    return (
        <div className="flex flex-col gap-6">
            {/* Tingkat Penyelesaian */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.performance_metrics.completion_rate}%</div>
                        <p className="text-xs text-muted-foreground">{dashboardData.performance_metrics.completed_tasks} dari {dashboardData.performance_metrics.total_tasks} tugas selesai</p>
                    </CardContent>
                </Card>

                {/* Deadline Terlewat*/}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tugas Lewat Tenggat</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.performance_metrics.overdue_tasks}</div>
                        <p className="text-xs text-muted-foreground">Tugas belum selesai & lewat deadline</p>
                    </CardContent>
                </Card>

                {/* Penyelesaian Rata-rata */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Penyelesaian Rata-rata</CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.performance_metrics.avg_completion_days || 'N/A'} Hari</div>
                        <p className="text-xs text-muted-foreground">Waktu rata-rata per tugas</p>
                    </CardContent>
                </Card>

                {/* Anggota Tim */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Anggota Tim</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.member_stats.length}</div>
                        <p className="text-xs text-muted-foreground">Anggota dengan tugas teratas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Performa Tim */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Performa Tim</CardTitle>
                        <CardDescription>Beban kerja dan penyelesaian tugas per anggota.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <ReBarChart data={dashboardData.member_stats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="member_name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                                <Legend />
                                <Bar dataKey="in_progress_tasks" name="Dikerjakan" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completed_tasks" name="Selesai" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </ReBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Ringkasan Tugas */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Ringkasan Tugas</CardTitle>
                        <CardDescription>Distribusi status semua tugas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={taskSummaryForPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                                    {taskSummaryForPie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[entry.name.toLowerCase().replace(' ', '_')]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Log Aktivitas  */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Aktivitas Terbaru</CardTitle>
                        <CardDescription>Perubahan terakhir yang dilakukan oleh tim.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {dashboardData.recent_activities.map(activity => (
                                <div key={activity.id} className="flex items-start gap-4">
                                    <div>
                                        <UserCircle className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <p>
                                            <span className="font-semibold">{activity.member_name}</span> memperbarui tugas 
                                            <span className="font-medium text-blue-600"> "{activity.task_title}"</span>.
                                        </p>
                                        <p className="mt-1 text-muted-foreground">
                                            Status diubah dari "{activity.old_status}" → "{activity.new_status}"
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {format(new Date(activity.timestamp), 'HH:mm')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Log Deadline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mendekati Deadline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {dashboardData.upcoming_deadlines.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>
                                            <div className="font-medium">{task.title}</div>
                                            <div className="text-sm text-muted-foreground">{task.member_name}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={task.days_remaining < 3 ? 'destructive' : 'secondary'}>
                                                {task.days_remaining} hari lagi
                                            </Badge>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {formatDate(task.end_date)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}