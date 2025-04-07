"use strict";
// Enums
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Pending"] = "Pending";
    TaskStatus["InProgress"] = "In Progress";
    TaskStatus["Completed"] = "Completed";
})(TaskStatus || (TaskStatus = {}));
// Abstract User class
class User {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
    changePassword(newPassword) {
        this.password = newPassword;
    }
    updateProfile(updateData) {
        Object.assign(this, updateData);
    }
}
// Notification class
class AppNotification {
    constructor(id, message, isRead = false, createdAt = new Date(), recipient // Composition with User
    ) {
        this.id = id;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.recipient = recipient;
    }
    markAsRead() {
        this.isRead = true;
    }
}
// Task class
class Task {
    constructor(id, description, timeLimit, conclusionTime = null, status = TaskStatus.Pending, assignedTo // Aggregation with User
    ) {
        this.id = id;
        this.description = description;
        this.timeLimit = timeLimit;
        this.conclusionTime = conclusionTime;
        this.status = status;
        this.assignedTo = assignedTo;
        // Association with Notification
        this.notifications = [];
    }
    isFinished() {
        return this.status === TaskStatus.Completed;
    }
    updateStatus(newStatus) {
        this.status = newStatus;
        if (newStatus === TaskStatus.Completed) {
            this.conclusionTime = new Date();
        }
    }
    addNotification(notification) {
        this.notifications.push(notification);
    }
}
// Event class
class AppEvent {
    constructor(name, dateStart, dateFinish, description, location, createdBy // Composition with Admin
    ) {
        this.name = name;
        this.dateStart = dateStart;
        this.dateFinish = dateFinish;
        this.description = description;
        this.location = location;
        this.createdBy = createdBy;
        // Association with Notification
        this.notifications = [];
        // Aggregation with User (participants)
        this.participants = [];
    }
    warning() {
        console.log(`Event "${this.name}" is approaching!`);
    }
    addNotification(notification) {
        this.notifications.push(notification);
    }
    addParticipant(user) {
        this.participants.push(user);
    }
}
// Manager class (inherits from User)
class Manager extends User {
    constructor(id, name, email, password, department) {
        super(id, name, email, password);
        this.department = department;
        // Aggregation with Employee
        this.employees = [];
    }
    authentication() {
        // Manager-specific authentication logic
        return true;
    }
    assignJob(task, employee) {
        task.assignedTo = employee;
        console.log(`Task "${task.description}" assigned to ${employee.name}`);
    }
    addEmployee(employee) {
        this.employees.push(employee);
    }
}
// Employee class (inherits from User)
class Employee extends User {
    constructor(id, name, email, password, position, shift, manager // Aggregation with Manager
    ) {
        super(id, name, email, password);
        this.position = position;
        this.shift = shift;
        this.manager = manager;
    }
    authentication() {
        // Employee-specific authentication logic
        return true;
    }
}
// Admin class (inherits from User)
class Admin extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password);
    }
    authentication() {
        // Admin-specific authentication logic
        return true;
    }
    createUser(userData) {
        // In a real implementation, this would return a Manager, Employee or Admin
        const id = Math.floor(Math.random() * 1000);
        return new Employee(id, userData.name, userData.email, userData.password, "", "");
    }
    updateUser(user, updateData) {
        user.updateProfile(updateData);
    }
    deleteUser(user) {
        console.log(`User ${user.name} deleted`);
    }
    createEvent(eventData) {
        return new AppEvent(eventData.name, eventData.dateStart, eventData.dateFinish, eventData.description, eventData.location, this);
    }
    updateEvent(event, updateData) {
        Object.assign(event, updateData);
    }
    deleteEvent(event) {
        console.log(`Event "${event.name}" deleted`);
    }
}
// Report class
class CustomReport {
    constructor(id, date, type, content) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.content = content;
    }
    generateReport() {
        return this.content;
    }
}
// Product class
class Product {
    constructor(id, name, description, price, category, supplier) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.supplier = supplier;
    }
}
// Sale class
class Sale {
    constructor(id, date, products = [] // Composition with Product
    ) {
        this.id = id;
        this.date = date;
        this.products = products;
    }
    totalAmount() {
        return this.products.reduce((sum, product) => sum + product.price, 0);
    }
}
// Stock class
class Stock {
    constructor(id, currentQuantity, expirationDate) {
        this.id = id;
        this.currentQuantity = currentQuantity;
        this.expirationDate = expirationDate;
        this.products = []; // Composition with Product
    }
    registerProduct(product) {
        this.products.push(product);
    }
    updateProduct(productId, updateData) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            Object.assign(product, updateData);
        }
    }
    deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
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
manager.assignJob(task, employee);
task.updateStatus(TaskStatus.InProgress);
console.log(task);
console.log("\n=== Event Management ===");
const evento = admin.createEvent({
    name: "Company Meeting",
    dateStart: new Date('2023-11-15'),
    dateFinish: new Date('2023-11-16'),
    description: "Annual company meeting",
    location: "Main Office",
    warning: function () {
        throw new Error("Function not implemented.");
    },
    notifications: [],
    addNotification: function (notification) {
        throw new Error("Function not implemented.");
    },
    participants: [],
    addParticipant: function (user) {
        throw new Error("Function not implemented.");
    }
});
evento.addParticipant(manager);
evento.addParticipant(employee);
console.log(evento);
console.log("\n=== Notifications ===");
const notif1 = new AppNotification(1, "New task assigned", false, new Date(), employee);
const notif2 = new AppNotification(2, "Event reminder", false, new Date(), manager);
task.addNotification(notif1);
evento.addNotification(notif2);
console.log(notif1);
console.log(notif2);
console.log("\n=== Product & Sales ===");
const product = new Product(1, "Laptop", "High performance laptop", 999.99, "Electronics", "Tech Supplier");
const sale = new Sale(1, new Date());
sale.products.push(product);
console.log("Sale total:", sale.totalAmount());
console.log("\n=== Stock Management ===");
const stock = new Stock(1, 10, new Date('2024-12-31'));
stock.registerProduct(product);
console.log(stock);
console.log("\n=== Report Generation ===");
const report = new CustomReport(1, new Date(), "Sales", "Monthly sales report");
console.log(report.generateReport());
