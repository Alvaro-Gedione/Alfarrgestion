// ============= Enums =============
enum TaskStatus {
    Pending = "Pending",
    InProgress = "In Progress",
    Completed = "Completed"
}

// ============= Classes Base =============
abstract class User {
    public notifications: AppNotification[] = []; // Composição (1-*)
    public tasks: Task[] = []; // Agregação (*-*)
    public events: AppEvent[] = []; // Agregação (*-*)

    constructor(
        public id: number,
        public name: string,
        public email: string,
        public password: string
    ) {}

    // Métodos para AppNotification (Composição 1-*)
    addNotification(message: string): AppNotification {
        const notification = new AppNotification(
            this.notifications.length + 1,
            message,
            false,
            new Date(),
            this
        );
        this.notifications.push(notification);
        return notification;
    }

    // Métodos para Task (Agregação *-*)
    assignTask(task: Task): void {
        if (!this.tasks.some(t => t.id === task.id)) {
            this.tasks.push(task);
            task.assignUser(this);
        }
    }

    // Métodos para AppEvent (Agregação *-*)
    registerForEvent(event: AppEvent): void {
        if (!this.events.some(e => e.id === event.id)) {
            this.events.push(event);
            event.addParticipant(this);
        }
    }

    authentication(): boolean {
        // Lógica de autenticação padrão para todos os usuários
        return this.email.endsWith("@empresa.com") && this.password.length > 6;
    }

    changePassword(newPassword: string): void {
        this.password = newPassword;
    }

    updateProfile(updateData: Partial<Omit<User, 'id'>>): void {
        Object.assign(this, updateData);
    }
}

// ============= Classes Especializadas (Herança) =============
class Manager extends User {
    public employees: Employee[] = []; // Agregação (1-*)

    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        public department: string
    ) {
        super(id, name, email, password);
    }

    // Métodos para Employee (Agregação 1-*)
    addEmployee(employee: Employee): void {
        if (!this.employees.some(e => e.id === employee.id)) {
            this.employees.push(employee);
            employee.manager = this;
        }
    }
}

class Employee extends User {
    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        public position: string,
        public shift: string,
        public manager?: Manager // Agregação (*-1)
    ) {
        super(id, name, email, password);
    }
}

class Admin extends User {
    public createdEvents: AppEvent[] = []; // Composição (1-*)
    public generatedReports: CustomReport[] = []; // Associação (*-*)

    constructor(
        id: number,
        name: string,
        email: string,
        password: string
    ) {
        super(id, name, email, password);
    }

    // Métodos para AppEvent (Composição 1-*)
    createEvent(eventData: { name: string; dateStart: Date; dateFinish: Date; description: string; location: string }): AppEvent {
        const event = new AppEvent(
            this.createdEvents.length + 1,
            eventData.name,
            eventData.dateStart,
            eventData.dateFinish,
            eventData.description,
            eventData.location,
            this
        );
        this.createdEvents.push(event);
        return event;
    }

    // Métodos para Report (Associação *-*)
    generateReport(type: string, content: string): CustomReport {
        const report = new CustomReport(
            this.generatedReports.length + 1,
            new Date(),
            type,
            content
        );
        this.generatedReports.push(report);
        return report;
    }
}

// ============= Classes de Domínio =============
class Task {
    public subTasks: Task[] = []; // Auto-Agregação (*-*)
    public assignedUsers: User[] = []; // Agregação (*-*)
    public notifications: AppNotification[] = []; // Associação (*-*)

    constructor(
        public id: number,
        public description: string,
        public timeLimit: Date,
        public conclusionTime: Date | null = null,
        public status: TaskStatus = TaskStatus.Pending
    ) {}

    // Métodos para User (Agregação *-*)
    assignUser(user: User): void {
        if (!this.assignedUsers.some(u => u.id === user.id)) {
            this.assignedUsers.push(user);
            user.assignTask(this);
        }
    }

    // Métodos para AppNotification (Associação *-*)
    addNotification(notification: AppNotification): void {
        if (!this.notifications.some(n => n.id === notification.id)) {
            this.notifications.push(notification);
        }
    }

    // Métodos para Task (Associação recursiva *-*)
    addSubTask(task: Task): void {
        if (!this.subTasks.some(t => t.id === task.id)) {
            this.subTasks.push(task);
        }
    }

    // Outros métodos
    updateStatus(newStatus: TaskStatus): void {
        this.status = newStatus;
        if (newStatus === TaskStatus.Completed) {
            this.conclusionTime = new Date();
        }
    }

    isFinished(): boolean {
        return this.status === TaskStatus.Completed;
    }
}

class AppEvent {
    public participants: User[] = []; // Agregação (*-*)
    public notifications: AppNotification[] = []; // Associação (*-*)

    constructor(
        public id: number,
        public name: string,
        public dateStart: Date,
        public dateFinish: Date,
        public description: string,
        public location: string,
        public createdBy: Admin // Composição (*-1)
    ) {}

    // Métodos para User (Agregação *-*)
    addParticipant(user: User): void {
        if (!this.participants.some(p => p.id === user.id)) {
            this.participants.push(user);
            user.registerForEvent(this);
        }
    }

    // Métodos para AppNotification (Associação *-*)
    addNotification(notification: AppNotification): void {
        if (!this.notifications.some(n => n.id === notification.id)) {
            this.notifications.push(notification);
        }
    }

    // Outros métodos
    warning(): void {
        console.log(`AppEvent "${this.name}" is coming soon!`);
    }
}

class AppNotification {
    constructor(
        public id: number,
        public message: string,
        public isRead: boolean,
        public createdAt: Date,
        public recipient: User // Composição (*-1)
    ) {}

    markAsRead(): void {
        this.isRead = true;
    }
}

class CustomReport {
    constructor(
        public id: number,
        public date: Date,
        public type: string,
        public content: string
    ) {}

    generateReport(): string {
        return this.content;
    }
}

class Resource {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public price: number,
        public category: string,
        public supplier: string
    ) {}
}

class Sale {
    public resources: Resource[] = []; // Composição (*-*)

    constructor(
        public id: number,
        public date: Date
    ) {}

    Resource(resource: Resource): void {
        this.resources.push(resource);
    }

    totalAmount(): number {
        return this.resources.reduce((sum, resource) => sum + resource.price, 0);
    }
}

class ResourceGroup {
    public resources: Resource[] = []; // Composição (*-*)

    constructor(
        public id: number,
        public currentQuantity: number,
        public expirationDate: Date
    ) {}

    registerResource(resource: Resource): void {
        this.resources.push(resource);
    }

    updateResource(resourceId: number, updateData: Partial<Resource>): void {
        const resource = this.resources.find(p => p.id === resourceId);
        if (resource) {
            Object.assign(resource, updateData);
        }
    }

    deleteResource(resourceId: number): void {
        this.resources = this.resources.filter(p => p.id !== resourceId);
    }
}

// ========== Example Usage ==========
console.log("=== Creating Users ===");
const admin = new Admin(1, "Admin User", "admin@example.com", "secure123");
const manager = new Manager(2, "Manager User", "manager@example.com", "manager123", "Sales");
const employee = new Employee(3, "Employee User", "employee@example.com", "employee123", "Sales Associate", "Morning", manager);

console.log(admin);
console.log(manager);
console.log(employee);

console.log("\n=== Task Management ===");
const task = new Task(1, "Complete sales report", new Date('2023-12-31'));
manager.assignTask(task);
task.updateStatus(TaskStatus.InProgress);
console.log(task);

console.log("\n=== AppEvent Management ===");
const evento = admin.createEvent({
    name: "Company Meeting",
    dateStart: new Date('2023-11-15'),
    dateFinish: new Date('2023-11-16'),
    description: "Annual company meeting",
    location: "Main Office",
});
evento.addParticipant(manager);
evento.addParticipant(employee);
console.log(evento);

console.log("\n=== Notifications ===");
const notif1 = new AppNotification(1, "New task assigned", false, new Date(), employee);
const notif2 = new AppNotification(2, "AppEvent reminder", false, new Date(), manager);
task.addNotification(notif1);
evento.addNotification(notif2);
console.log(notif1);
console.log(notif2);
console.log("\n=== Resource & Sales ===");
const resource = new Resource(1, "Laptop", "High performance laptop", 999.99, "Electronics", "Tech Supplier");
const sale = new Sale(1, new Date());
// Add resource to the sale
sale.Resource(resource);
console.log("Sale total:", sale.totalAmount());

console.log("\n=== ResourceGroup Management ===");
const resourceGroup = new ResourceGroup(1, 10, new Date('2024-12-31'));
resourceGroup.registerResource(resource);
console.log(resourceGroup);

console.log("\n=== Report Generation ===");
const report = new CustomReport(1, new Date(), "Sales", "Monthly sales report");
console.log(report.generateReport());