// src/pages/dashboard/TeamPage.jsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import fungsi API yang sudah Anda buat
import { getMembers, createMember, updateMember, deleteMember } from "@/services/api"; // Sesuaikan path

export default function TeamPage() {
    // State untuk data, loading, dan error
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk mengontrol dialog
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    // State untuk menyimpan data member yang sedang dipilih untuk diedit atau dihapus
    const [selectedMember, setSelectedMember] = useState(null);

    // Fetch data saat komponen pertama kali dimuat
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const data = await getMembers();
                setMembers(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    // Fungsi untuk membuka dialog form dalam mode 'Tambah'
    const handleAdd = () => {
        setSelectedMember(null); // Kosongkan selectedMember untuk menandakan mode 'Tambah'
        setIsFormDialogOpen(true);
    };

    // Fungsi untuk membuka dialog form dalam mode 'Edit'
    const handleEdit = (member) => {
        setSelectedMember(member);
        setIsFormDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi 'Hapus'
    const handleDelete = (member) => {
        setSelectedMember(member);
        setIsDeleteDialogOpen(true);
    };

    // Fungsi yang dijalankan saat form di-submit (baik untuk tambah maupun edit)
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const memberData = {
            name: formData.get('name'),
            role: formData.get('role'),
        };

        try {
            if (selectedMember) {
                // Mode Edit: Panggil API update
                const updatedMember = await updateMember(selectedMember.id, memberData);
                setMembers(members.map(m => m.id === selectedMember.id ? updatedMember : m));
            } else {
                // Mode Tambah: Panggil API create
                const newMember = await createMember(memberData);
                setMembers([...members, newMember]);
            }
            setIsFormDialogOpen(false); // Tutup dialog setelah berhasil
            setSelectedMember(null);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // Fungsi yang dijalankan saat penghapusan dikonfirmasi
    const handleDeleteConfirm = async () => {
        if (!selectedMember) return;
        try {
            await deleteMember(selectedMember.id);
            // Hapus anggota dari state setelah berhasil
            setMembers(members.filter(m => m.id !== selectedMember.id));
            setIsDeleteDialogOpen(false); // Tutup dialog
            setSelectedMember(null);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <div className="text-center p-4">Memuat data anggota...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Manajemen Tim</h1>
                <Button onClick={handleAdd}>Tambah Anggota</Button>
            </div>

            {/* Tabel Anggota Tim */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length > 0 ? (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.role || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(member)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(member)}>
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">Belum ada anggota tim.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog untuk Tambah/Edit Anggota */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <DialogTitle>{selectedMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
                            <DialogDescription>
                                {selectedMember ? 'Perbarui detail anggota tim di sini.' : 'Isi detail untuk anggota tim baru.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nama</Label>
                                <Input id="name" name="name" defaultValue={selectedMember?.name || ''} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Peran</Label>
                                <Input id="role" name="role" defaultValue={selectedMember?.role || ''} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" variant="secondary">Batal</Button>
                            </DialogClose>
                            <Button type="submit">{selectedMember ? 'Simpan Perubahan' : 'Tambah Anggota'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* AlertDialog untuk Konfirmasi Hapus */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus anggota tim bernama "{selectedMember?.name}" secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}