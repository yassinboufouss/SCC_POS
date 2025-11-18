import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initial translations (only core strings for now)
const resources = {
  en: {
    translation: {
      "app_title": "Gym POS System",
      "dashboard": "Dashboard",
      "members": "Members",
      "check_in": "Check-In",
      "pos": "POS",
      "classes": "Classes",
      "trainers": "Trainers",
      "inventory": "Inventory",
      "membership_plans": "Membership Plans",
      "finance_reports": "Finance & Reports",
      "settings": "Settings",
      "log_in": "Log In",
      "logout": "Logout",
      "search_by_name": "Search by name...",
      "active_members": "Active Members",
      "total_revenue_mtd": "Total Revenue (MTD)",
      "daily_checkins": "Daily Check-ins",
      "low_stock_items": "Low Stock Items",
      "member_management": "Member Management",
      "register_new_member": "Register New Member",
      "schedule_management": "Class Schedule Management",
      "add_new_class": "Add New Class",
      "trainer_management": "Trainer Management",
      "add_new_trainer": "Add New Trainer",
      "inventory_management": "Inventory Management",
      "add_new_item": "Add New Item",
      "plans_management": "Membership Plans Management",
      "create_new_plan": "Create New Plan",
      "finance_reports_title": "Finance & Reports",
      "transaction_history": "Transaction History",
      "application_settings": "Application Settings",
    }
  },
  fr: {
    translation: {
      "app_title": "Système PDV de Gym",
      "dashboard": "Tableau de Bord",
      "members": "Membres",
      "check_in": "Enregistrement",
      "pos": "PDV",
      "classes": "Cours",
      "trainers": "Entraîneurs",
      "inventory": "Inventaire",
      "membership_plans": "Plans d'Adhésion",
      "finance_reports": "Finance & Rapports",
      "settings": "Paramètres",
      "log_in": "Se Connecter",
      "logout": "Déconnexion",
      "search_by_name": "Rechercher par nom...",
      "active_members": "Membres Actifs",
      "total_revenue_mtd": "Revenus Totaux (Mois)",
      "daily_checkins": "Enregistrements Quotidiens",
      "low_stock_items": "Articles à Faible Stock",
      "member_management": "Gestion des Membres",
      "register_new_member": "Enregistrer Nouveau Membre",
      "schedule_management": "Gestion des Horaires de Cours",
      "add_new_class": "Ajouter Nouveau Cours",
      "trainer_management": "Gestion des Entraîneurs",
      "add_new_trainer": "Ajouter Nouvel Entraîneur",
      "inventory_management": "Gestion des Stocks",
      "add_new_item": "Ajouter Nouvel Article",
      "plans_management": "Gestion des Plans d'Adhésion",
      "create_new_plan": "Créer Nouveau Plan",
      "finance_reports_title": "Finance & Rapports",
      "transaction_history": "Historique des Transactions",
      "application_settings": "Paramètres de l'Application",
    }
  },
  ar: {
    translation: {
      "app_title": "نظام نقاط البيع للنادي الرياضي",
      "dashboard": "لوحة القيادة",
      "members": "الأعضاء",
      "check_in": "تسجيل الدخول",
      "pos": "نقطة البيع",
      "classes": "الصفوف",
      "trainers": "المدربون",
      "inventory": "المخزون",
      "membership_plans": "خطط العضوية",
      "finance_reports": "المالية والتقارير",
      "settings": "الإعدادات",
      "log_in": "تسجيل الدخول",
      "logout": "تسجيل الخروج",
      "search_by_name": "البحث بالاسم...",
      "active_members": "الأعضاء النشطون",
      "total_revenue_mtd": "إجمالي الإيرادات (شهريًا)",
      "daily_checkins": "تسجيلات الدخول اليومية",
      "low_stock_items": "عناصر منخفضة المخزون",
      "member_management": "إدارة الأعضاء",
      "register_new_member": "تسجيل عضو جديد",
      "schedule_management": "إدارة جدول الصفوف",
      "add_new_class": "إضافة صف جديد",
      "trainer_management": "إدارة المدربين",
      "add_new_trainer": "إضافة مدرب جديد",
      "inventory_management": "إدارة المخزون",
      "add_new_item": "إضافة عنصر جديد",
      "plans_management": "إدارة خطط العضوية",
      "create_new_plan": "إنشاء خطة جديدة",
      "finance_reports_title": "المالية والتقارير",
      "transaction_history": "سجل المعاملات",
      "application_settings": "إعدادات التطبيق",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
        order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
        caches: ['localStorage'],
    }
  });

export default i18n;