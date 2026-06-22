import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/services/user.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  searchText = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  roles = ['ADMIN', 'SALES', 'FINANCE', 'TECH', 'CLIENT'];

  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedUser: any = {};
  deleteConfirmId: number | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  search(): void {
    const q = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }

  openAdd(): void {
    this.selectedUser = { username: '', email: '', role: 'CLIENT', password: '' };
    this.modalMode = 'add';
    this.showModal = true;
  }

  openEdit(user: User): void {
    this.selectedUser = { ...user, password: '' };
    this.modalMode = 'edit';
    this.showModal = true;
  }

  openView(user: User): void {
    this.selectedUser = { ...user };
    this.modalMode = 'view';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = {};
  }

  saveUser(): void {
    if (this.modalMode === 'add') {
      this.userService.create(this.selectedUser).subscribe({
        next: () => {
          this.showSuccess('User created successfully!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => this.showError(err.error?.message || 'Failed to create user.')
      });
    } else if (this.modalMode === 'edit') {
      this.userService.update(this.selectedUser.id, this.selectedUser).subscribe({
        next: () => {
          this.showSuccess('User updated successfully!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => this.showError(err.error?.message || 'Failed to update user.')
      });
    }
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  deleteUser(): void {
    if (this.deleteConfirmId === null) return;
    this.userService.delete(this.deleteConfirmId).subscribe({
      next: () => {
        this.showSuccess('User deleted.');
        this.deleteConfirmId = null;
        this.loadUsers();
      },
      error: () => this.showError('Failed to delete user.')
    });
  }

  getRoleBadgeClass(role: string): string {
    const map: any = {
      ADMIN: 'badge-admin',
      SALES: 'badge-sales',
      FINANCE: 'badge-finance',
      TECH: 'badge-tech',
      CLIENT: 'badge-client'
    };
    return map[role] || '';
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}