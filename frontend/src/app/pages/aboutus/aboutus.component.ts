import { Component } from '@angular/core';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutusComponent {

  searchText = "";

  sectionsMap: { [key: string]: string } = {
    "who": "who-we-are",
    "who we are": "who-we-are",
    "overview": "who-we-are",
    "company": "who-we-are",
    "awards": "awards",
    "recognition": "awards",
    "award": "awards",
    "values": "values",
    "core values": "values",
    "value": "values",
    "expertise": "expertise",
    "skills": "expertise",
    "locations": "locations",
    "offices": "locations",
    "presence": "locations"
  };

  liveSearch() {
    const value = this.searchText.toLowerCase().trim();

    if (!value) return;

    for (const key in this.sectionsMap) {
      if (key.startsWith(value) || (value.length > 1 && key.includes(value))) {
        const id = this.sectionsMap[key];
        this.scrollToSection(id);
        return;
      }
    }

    const directId = value.replace(/\s+/g, '-');
    if (document.getElementById(directId)) {
      this.scrollToSection(directId);
    }
  }

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      element.style.transition = 'background 0.3s';
      element.style.backgroundColor = '#fff7e0';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 800);
    }
  }
  scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

ngOnInit() {
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }
  });
}
}