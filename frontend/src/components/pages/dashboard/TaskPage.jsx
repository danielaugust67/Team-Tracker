import { useEffect, useState, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea"; // Impor Textarea
import { MoreHorizontal, PlusCircle, Search, Loader2 } from "lucide-react";

import * as api from "@/services/api";

const taskSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter."),
  description: z.string().optional().nullable(),
  status: z.enum(["Belum Dimulai", "Sedang Dikerjakan", "Selesai"]),
  member_id: z.coerce.number().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

const getStatusBadgeVariant = (status) => ({ "Selesai": "default", "Sedang Dikerjakan": "secondary", "Belum Dimulai": "destructive" })[status] || "outline";
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Semua"); 
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 10;

    const form = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: { title: "", description: "", status: "Belum Dimulai", member_id: null, start_date: null, end_date: null },
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [tasksData, membersData] = await Promise.all([
                    api.getTasks(),
                    api.getMembers()
                ]);
                setTasks(tasksData);
                setMembers(membersData);
            } catch (error) {
                toast.error("Gagal memuat data awal.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await api.getTasks();
            setTasks(data);
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                if (statusFilter === "Semua") return true;
                return task.status === statusFilter;
            })
            .filter(task => {
                return task.title.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [tasks, searchTerm, statusFilter]); 

    useEffect(() => {
        setCurrentPage(1); 
    }, [searchTerm, statusFilter]);


    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const currentTasks = filteredTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);
    
    const getMemberName = (memberId) => members.find(m => m.id === memberId)?.name || "Tidak Ditugaskan";

    const handleOpenDialog = (task = null) => {
        setEditingTask(task);
        form.reset(task ? {
            ...task,
            description: task.description || "",
            start_date: task.start_date ? task.start_date.split('T')[0] : "",
            end_date: task.end_date ? task.end_date.split('T')[0] : "",
        } : { title: "", description: "", status: "Belum Dimulai", member_id: null, start_date: "", end_date: "" });
        setDialogOpen(true);
    };

    const onSubmit = async (values) => {
        // Pastikan nilai kosong dikirim sebagai null
        const payload = {
            ...values,
            member_id: values.member_id || null,
            description: values.description || null,
            start_date: values.start_date || null,
            end_date: values.end_date || null,
        };
        
        const promise = editingTask
            ? api.updateTask(editingTask.id, payload)
            : api.createTask(payload);

        toast.promise(promise, {
            loading: 'Menyimpan tugas...',
            success: () => { fetchTasks(); setDialogOpen(false); return `Tugas berhasil ${editingTask ? 'diperbarui' : 'dibuat'}!`; },
            error: (err) => err.message,
        });
    };

    const handleDeleteClick = (task) => { setTaskToDelete(task); setDeleteAlertOpen(true); };
    const handleDeleteConfirm = async () => {
        if (!taskToDelete) return;
        toast.promise(api.deleteTask(taskToDelete.id), {
            loading: 'Menghapus tugas...',
            success: () => { fetchTasks(); setDeleteAlertOpen(false); return "Tugas berhasil dihapus."; },
            error: (err) => err.message,
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CardTitle>Daftar Tugas</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter berdasarkan status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Semua">Semua Status</SelectItem>
                                    <SelectItem value="Belum Dimulai">Belum Dimulai</SelectItem>
                                    <SelectItem value="Sedang Dikerjakan">Sedang Dikerjakan</SelectItem>
                                    <SelectItem value="Selesai">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="search" placeholder="Cari tugas..." className="w-full pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={() => handleOpenDialog()} className="shrink-0">
                                <PlusCircle className="h-4 w-4 mr-2" /> Tambah
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tugas</TableHead>
                                    <TableHead>Anggota</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tenggat</TableHead>
                                    <TableHead><span className="sr-only">Aksi</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="animate-spin inline-block" /></TableCell></TableRow>
                                ) : currentTasks.length > 0 ? (
                                    currentTasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>{getMemberName(task.member_id)}</TableCell>
                                            <TableCell><Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge></TableCell>
                                            <TableCell>{formatDate(task.end_date)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleOpenDialog(task)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteClick(task)}>Hapus</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Tidak ada tugas ditemukan.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="pt-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} disabled={currentPage === 1} />
                                </PaginationItem>
                                <span className="p-2 text-sm">Halaman {currentPage} dari {totalPages}</span>
                                <PaginationItem>
                                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} disabled={currentPage === totalPages} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardContent>
            </Card>

            {/* --- Dialog untuk Tambah/Edit Tugas --- */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>{editingTask ? 'Edit Tugas' : 'Buat Tugas Baru'}</DialogTitle>
                                <DialogDescription>
                                    Isi detail tugas di bawah ini. Klik simpan jika sudah selesai.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Judul Tugas</FormLabel>
                                    <FormControl><Input placeholder="Contoh: Membuat halaman login" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                                    <FormControl><Textarea placeholder="Jelaskan detail tugas di sini..." {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Belum Dimulai">Belum Dimulai</SelectItem>
                                                <SelectItem value="Sedang Dikerjakan">Sedang Dikerjakan</SelectItem>
                                                <SelectItem value="Selesai">Selesai</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="member_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ditugaskan Kepada</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih anggota" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="0">Tidak Ditugaskan</SelectItem>
                                                {members.map(member => (
                                                    <SelectItem key={member.id} value={member.id.toString()}>{member.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="start_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Mulai (Opsional)</FormLabel>
                                        <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="end_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Selesai (Opsional)</FormLabel>
                                        <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingTask ? 'Simpan Perubahan' : 'Buat Tugas'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* --- AlertDialog untuk Konfirmasi Hapus --- */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tugas "{taskToDelete?.title}" secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

