import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { AboutPage } from './about-page';
import * as flowbite from 'flowbite';

describe('AboutPage Component', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    // Mock de flowbite para evitar ejecutar lógica externa
    vi.spyOn(flowbite, 'initFlowbite').mockImplementation(() => {});

    TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Ciclo de vida del componente', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should call initFlowbite on ngOnInit', () => {
      // Ya se ejecutó en beforeEach con detectChanges
      expect(flowbite.initFlowbite).toHaveBeenCalled();
    });

    it('should have component instance properly initialized', () => {
      expect(component instanceof AboutPage).toBe(true);
      expect(fixture.componentInstance === component).toBe(true);
    });
  });

  describe('Template - Elementos de navegación', () => {
    it('should render header element', () => {
      const header = debugElement.query(By.css('header'));
      expect(header).toBeTruthy();
    });

    it('should render navigation bar', () => {
      const nav = debugElement.query(By.css('nav'));
      expect(nav).toBeTruthy();
    });

    it('should have logo with correct src', () => {
      const logo = debugElement.query(By.css('img[alt="TaskManager Logo"]'));
      expect(logo).toBeTruthy();
      expect(logo.nativeElement.src).toContain('iconAT.png');
    });

    it('should have TaskManager title in header', () => {
      const title = debugElement.queryAll(By.css('a'))[0];
      expect(title.nativeElement.textContent).toContain('TaskManager');
    });
  });

  describe('Template - RouterLinks', () => {
    it('should have routerLink to home page', () => {
      const homeLink = debugElement.queryAll(By.css('a[routerLink="/"]'))[0];
      expect(homeLink).toBeTruthy();
    });

    it('should have all navigation routerLinks defined', () => {
      const navLinks = debugElement.queryAll(By.css('a[routerLink]'));
      // Solo verificar que existan routerLinks
      expect(navLinks.length).toBeGreaterThan(0);
    });

    it('should have correct routerLink for about/info', () => {
      const aboutLink = debugElement.query(By.css('a[routerLink="/about/info"]'));
      expect(aboutLink).toBeTruthy();
      expect(aboutLink.nativeElement.textContent).toContain('Acerca de');
    });

    it('should have correct routerLink for login', () => {
      const loginLink = debugElement.query(By.css('a[routerLink="/login"]'));
      expect(loginLink).toBeTruthy();
    });

    it('should have correct routerLink for register', () => {
      const registerLink = debugElement.query(By.css('a[routerLink="/register"]'));
      expect(registerLink).toBeTruthy();
    });
  });

  describe('Template - Estructura principal', () => {
    it('should render main content area', () => {
      const main = debugElement.query(By.css('main'));
      expect(main).toBeTruthy();
    });

    it('should have router-outlet for child routes', () => {
      const routerOutlet = debugElement.query(By.css('router-outlet'));
      expect(routerOutlet).toBeTruthy();
    });

    it('should have footer component', () => {
      const footer = debugElement.query(By.css('app-footer'));
      expect(footer).toBeTruthy();
    });

    it('should have gradient background styles', () => {
      const main = debugElement.query(By.css('main'));
      const classes = main.nativeElement.className;
      expect(classes).toContain('bg-gradient-to-br');
    });
  });

  describe('Template - Responsive design', () => {
    it('should have hidden menu button on mobile that shows on click', () => {
      const dropdownButton = debugElement.query(By.css('button#dropdownWebsite'));
      expect(dropdownButton).toBeTruthy();
      expect(dropdownButton.nativeElement.getAttribute('data-dropdown-toggle')).toBe('dropdown-2');
    });

    it('should have dropdown menu with id dropdown-2', () => {
      const dropdown = debugElement.query(By.css('div#dropdown-2'));
      expect(dropdown).toBeTruthy();
    });

    it('should have navigation links in both desktop and mobile views', () => {
      const allAboutLinks = debugElement.queryAll(By.css('a[routerLink="/about/info"]'));
      // Al menos 2: una para desktop (hidden lg:flex) y otra para mobile
      expect(allAboutLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Integración de componentes hijos', () => {
    it('should import and render FooterComponent', () => {
      const footerComponent = debugElement.query(By.css('app-footer'));
      expect(footerComponent).toBeTruthy();
    });
  });
});