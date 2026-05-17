import { inject, Injectable, signal } from "@angular/core";
import { UserRole, UserRoleRequest, UserSearchEmailResult } from "../users/user.interfaces";
import { debounceTime, Subject } from "rxjs";
import { UserService } from "../users/user.service";
import { ToastService } from "../toast/toast.service";

@Injectable({ providedIn: 'root' })
export class ProjectTeamTableService {

  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  private readonly selectedMembersSignal = signal<UserRole[]>([]);
  private readonly teamMembersInputSignal = signal<UserRole>({ id: '', name: '', email: '', avatar: '', role: '' });
  private readonly emailSuggestionsSignal = signal<UserSearchEmailResult[]>([]);
  private readonly showSuggestionsSignal = signal(false);
  private readonly isEditModeSignal = signal(false);
  private readonly searchSubject = new Subject<string>();

  readonly isEditMode = this.isEditModeSignal.asReadonly(); 
  readonly selectedMembers = this.selectedMembersSignal.asReadonly();
  readonly teamMembersInput = this.teamMembersInputSignal.asReadonly();
  readonly emailSuggestions = this.emailSuggestionsSignal.asReadonly();
  readonly showSuggestions = this.showSuggestionsSignal.asReadonly();

  constructor() {
    this.setupEmailSearch();
  }

  setSelectedMembers(members: UserRole[]): void {
    this.selectedMembersSignal.set(members);
  }

  loadTeamMembers(team: UserRoleRequest[]): void {
    this.userService.searchTeamById(team).subscribe({
      next: (members) => {
        this.selectedMembersSignal.set(members);
      },
      error: (err) => {
        console.error('Error loading team members:', err);
        this.toastService.error("Failed to load team members. Please try again later.");
      }
    });
  }
  
  onEmailInput(event: Event): void {
    const input = (event.target as HTMLTextAreaElement).value;
    this.teamMembersInputSignal.update(current => ({ ...current, email: input }));
    this.searchSubject.next(this.teamMembersInput().email);
  }

  updateMemberRole(event: Event): void {
    const role = (event.target as HTMLInputElement).value;
    this.teamMembersInputSignal.update(current => ({ ...current, role }));
  }

  selectEmailSuggestion(suggestion: UserSearchEmailResult): void {
    if (this.selectedMembers().some(member => member.id === suggestion.id)) {
      this.toastService.info("Email already added to the team members.");
      return;
    }
    this.teamMembersInputSignal.update(current => ({
      email: suggestion.email,
      name: suggestion.name,
      avatar: suggestion.avatar,
      id: suggestion.id,
      role: current.role
    }));
    this.emailSuggestionsSignal.set([]);
    this.showSuggestionsSignal.set(false);
  }

  closeSuggestions(): void {
    this.showSuggestionsSignal.set(false);
  }

  cleanInputMember(): void {
    this.teamMembersInputSignal.set({ id: '', name: '', email: '', avatar: '', role: '' });
    this.emailSuggestionsSignal.set([]);
    this.showSuggestionsSignal.set(false);
  }

  addTeamMember(): void {
    const email = this.teamMembersInput().email.trim();
    const role = this.teamMembersInput().role.trim();
    const userId = this.teamMembersInput().id.trim();
    if (!email || !role) {
      this.toastService.error("Ingrese un email y un rol por favor.");
      return;
    }
    if (!userId) {
      this.toastService.error("Selecciona un usuario válido de las sugerencias antes de agregar.");
      return;
    }
    if (this.selectedMembers().some(member => member.email === email)) {
      this.toastService.info("Email ya esta registrado como miembro.");
      return;
    }
    this.selectedMembersSignal.update(members => [...members, { ...this.teamMembersInput() }]);
    this.teamMembersInputSignal.set({ id: '', name: '', email: '', avatar: '', role: '' });
    this.toastService.success("Miembro agregado al equipo existosamente.");
  }

  removeTeamMember(memberId: string): void {
    const updatedMembers = this.selectedMembersSignal().filter(member => member.id !== memberId);
    this.selectedMembersSignal.set(updatedMembers);
    this.toastService.info("Miembro eliminado correctamente")
  }

  setIsEditMode(val: boolean){
    this.isEditModeSignal.set(val)
  }

  private setupEmailSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(searchTerm => {
      if (searchTerm.trim().length >= 2) {
        this.userService.searchUsersByEmail(searchTerm).subscribe({
          next: (suggestions) => {
            this.emailSuggestionsSignal.set(suggestions);
            this.showSuggestionsSignal.set(true);
          },
          error: (err) => {
            console.error('Error searching users:', err);
            this.emailSuggestionsSignal.set([]);
            this.showSuggestionsSignal.set(false);
          }
        });
      } else {
        this.emailSuggestionsSignal.set([]);
        this.showSuggestionsSignal.set(false);
      }
    });
  }
}