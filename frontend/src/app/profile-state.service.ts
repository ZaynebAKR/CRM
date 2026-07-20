import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ProfileData {
  username: string;
  email: string;
  profileImageUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileStateService {
  private profileSubject = new BehaviorSubject<ProfileData>({
    username: '',
    email: '',
    profileImageUrl: null
  });

  profile$ = this.profileSubject.asObservable();

  setProfile(data: ProfileData) {
    this.profileSubject.next(data);
  }

  updateImage(url: string) {
    this.profileSubject.next({ ...this.profileSubject.value, profileImageUrl: url });
  }

  updateNameEmail(username: string, email: string) {
    this.profileSubject.next({ ...this.profileSubject.value, username, email });
  }
}