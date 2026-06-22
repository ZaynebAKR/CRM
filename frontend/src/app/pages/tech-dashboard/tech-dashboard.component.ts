import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { License } from 'src/app/models/license.model';

interface KanbanCard {
  license: License;
  dragging?: boolean;
}

@Component({
  selector: 'app-tech-dashboard',
  templateUrl: './tech-dashboard.component.html',
  styleUrls: ['./tech-dashboard.component.css']
})
export class TechDashboardComponent implements OnInit {

  allLicenses: License[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedLicense: License | null = null;
  showDetailModal = false;
  showNoteModal = false;
  noteText = '';
  pendingStatus = '';
  draggedLicense: License | null = null;
  today = new Date().toISOString().split('T')[0];

  columns = [
    { key: 'NOT_STARTED', label: 'Not Started', icon: 'fas fa-hourglass-start', color: '#f57f17' },
    { key: 'IN_PROGRESS', label: 'In Progress',  icon: 'fas fa-cogs',            color: '#1565c0' },
    { key: 'DEPLOYED',    label: 'Deployed',      icon: 'fas fa-check-circle',    color: '#2e7d32' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadLicenses(); }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token')
               ?? sessionStorage.getItem('auth_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadLicenses(): void {
    this.loading = true;
    this.http.get<License[]>('http://localhost:8081/licenses/tech/all', { headers: this.headers() }).subscribe({
      next: (data) => { this.allLicenses = data; this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load licenses.'; this.loading = false; }
    });
  }

  getColumn(status: string): License[] {
    return this.allLicenses.filter(l => (l.deploymentStatus || 'NOT_STARTED') === status);
  }

  onDragStart(license: License): void {
    this.draggedLicense = license;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, status: string): void {
    event.preventDefault();
    if (!this.draggedLicense) return;
    if ((this.draggedLicense.deploymentStatus || 'NOT_STARTED') === status) return;

    if (status === 'IN_PROGRESS' || status === 'DEPLOYED') {
      this.pendingStatus = status;
      this.noteText = this.draggedLicense.deploymentNote || '';
      this.showNoteModal = true;
    } else {
      this.applyStatus(this.draggedLicense, status, '');
    }
  }

  applyStatus(license: License, status: string, note: string): void {
    this.http.put<License>(
      `http://localhost:8081/licenses/tech/${license.id}/deployment`,
      { deploymentStatus: status, note },
      { headers: this.headers() }
    ).subscribe({
      next: (updated) => {
        const idx = this.allLicenses.findIndex(l => l.id === updated.id);
        if (idx !== -1) this.allLicenses[idx] = updated;
        this.allLicenses = [...this.allLicenses];
        this.showSuccess(`Moved to ${status.replace('_', ' ')}`);
        this.showNoteModal = false;
        this.draggedLicense = null;
      },
      error: () => this.showError('Failed to update deployment status.')
    });
  }

  confirmNote(): void {
    if (!this.draggedLicense) return;
    this.applyStatus(this.draggedLicense, this.pendingStatus, this.noteText);
  }

  openDetail(license: License): void {
    this.selectedLicense = license;
    this.showDetailModal = true;
  }

  isExpiringSoon(license: License): boolean {
    if (!license.expiryDate) return false;
    const diff = new Date(license.expiryDate).getTime() - new Date().getTime();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }

  get totalLicenses(): number { return this.allLicenses.length; }
  get countNotStarted(): number { return this.getColumn('NOT_STARTED').length; }
  get countInProgress(): number { return this.getColumn('IN_PROGRESS').length; }
  get countDeployed(): number { return this.getColumn('DEPLOYED').length; }
  get countExpiringSoon(): number { return this.allLicenses.filter(l => this.isExpiringSoon(l)).length; }

  getStatusClass(status: string): string {
    const map: any = { ACTIVE: 'status-active', EXPIRED: 'status-expired', PENDING: 'status-pending' };
    return map[status] || '';
  }

  getDeployClass(status: string): string {
    const map: any = { NOT_STARTED: 'deploy-not', IN_PROGRESS: 'deploy-progress', DEPLOYED: 'deploy-done' };
    return map[status] || 'deploy-not';
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