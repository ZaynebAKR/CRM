import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputField') inputField!: ElementRef;

  isChatOpen = false;
  userInput = '';
  messages: Message[] = [];
  isTyping = false;
  errorMessage = '';
  unreadCount = 0;
  private shouldScrollToBottom = false;

  private apiUrl = 'http://localhost:8081/api/chat'; 
  quickQuestions = [
    'What services does INSOMEA offer?',
    'Where are your offices?',
    'What certifications do you have?',
    'How can I contact INSOMEA?',
  ];

  // ✅ All INSOMEA information — this is your "training data"
  private systemPrompt = `You are a helpful and friendly virtual assistant for INSOMEA COMPUTER SOLUTIONS, a Microsoft Cloud Gold Partner operating in the MEA region.

ABOUT INSOMEA:
- Full name: INSOMEA COMPUTER SOLUTIONS
- Founded: 2016
- Microsoft Cloud Partner since: 2014
- Part of the Beyon Solutions company group
- Specializes in: Microsoft 365, Microsoft Azure, Cybersecurity, and Training

KEY STATS:
- 50+ employees
- 500+ customers
- 8+ years of expertise
- 8 Advanced Specializations (Security & Modern Workplace)
- 15+ Gold Competencies across Microsoft technologies
- 150+ Microsoft certifications in the team
- 15+ Microsoft Certified Trainers
- 1 MVP (Most Valuable Professional) - only 6 in all of North Africa

AWARDS:
- Microsoft Partner of the Year: Tunisia 2021 & 2022
- Microsoft Partner of the Year: Bahrain 2020
- 5 Partner of the Year Awards total

OFFICES:
- Tunisia: Immeuble lac d'or "Business Center", Bloc B, 3ème étage, Les Berges du Lac, Tunis 1053 | Phone: +216 98 174 454
- Bahrain: Office 2902, Al-Moayyed Tower, Seef Area, Manama 428 | Phone: +973 13 300 707
- France: Rue de Stockholm 75008 Paris, RCS Paris
- Algeria: Bois des cars 01 Villa 63 Bureau 74 1er étage Dely Ibrahim, Alger
- Morocco: Rue Soumaya Résidence Shehrazade 3, 5ème étage, n° 22 Palmiers, Casablanca
- Ivory Coast: Yopougon maroc ananeraie, 02 BP Abidjan 02, Abidjan, CI

SERVICES:
1. Cloud Solutions: Microsoft Azure, Microsoft 365, Cloud Infrastructure, App Modernization
2. Cybersecurity: Identity & Access Management, Information Protection & Governance, Threat Protection, Cloud Security Solutions
3. Modern Workplace: Adoption & Change Management, Microsoft Teams Deployment, Meetings & Meeting Rooms, Teamwork Deployment
4. Training: Microsoft Certification Programs, Technical Workshops, End-User Training, Professional Development

CORE VALUES:
1. End to End Change Management
2. Certified Team
3. Adoption
4. Continuous Support

CONTACT:
- Email: info@insomea.com
- Tunisia phone: +216 98 174 454
- Bahrain phone: +973 13 300 707

INSTRUCTIONS:
- Answer ONLY questions related to INSOMEA
- Be professional, friendly and concise
- If the user writes in French, answer in French
- If the user writes in Arabic, answer in Arabic
- Otherwise answer in English`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.inputField?.nativeElement.focus(), 300);
    }
  }

  clearChat(): void {
    this.messages = [];
    this.errorMessage = '';
  }

onEnterKey(event: any): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
autoResize(event: any): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  sendQuickQuestion(question: string): void {
    this.userInput = question;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isTyping) return;

    this.errorMessage = '';
    this.userInput = '';

    if (this.inputField) {
      this.inputField.nativeElement.style.height = 'auto';
    }

    this.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    this.isTyping = true;
    this.shouldScrollToBottom = true;

    const payload = {
      systemPrompt: this.systemPrompt,
      messages: this.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    this.http.post<{ response: string }>(this.apiUrl, payload).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({
          role: 'assistant',
          content: res.response,
          timestamp: new Date(),
        });
        if (!this.isChatOpen) this.unreadCount++;
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        this.isTyping = false;
        this.errorMessage = 'Connection error. Please try again.';
        console.error('Chatbot error:', err);
        this.shouldScrollToBottom = true;
      },
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
