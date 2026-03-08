/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIChat from './pages/AIChat';
import Alerts from './pages/Alerts';
import Dashboard from './pages/Dashboard';
import Drones from './pages/Drones';
import FieldImaging from './pages/FieldImaging';
import FireDepartments from './pages/FireDepartments';
import FireGallery from './pages/FireGallery';
import FireSafety from './pages/FireSafety';
import HealthImpact from './pages/HealthImpact';
import KnowledgeBase from './pages/KnowledgeBase';
import RiskMap from './pages/RiskMap';
import UserHealth from './pages/UserHealth';
import Zones from './pages/Zones';
import AlertSettings from './pages/AlertSettings';
import ActiveFireAlerts from './pages/ActiveFireAlerts';
import AlertDetails from './pages/AlertDetails';
import EmergencyAlertDetails from './pages/EmergencyAlertDetails';
import AdminAlerts from './pages/AdminAlerts';
import AdminWildfireEvents from './pages/AdminWildfireEvents';
import Monitoring from './pages/Monitoring';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIChat": AIChat,
    "Alerts": Alerts,
    "Dashboard": Dashboard,
    "Drones": Drones,
    "FieldImaging": FieldImaging,
    "FireDepartments": FireDepartments,
    "FireGallery": FireGallery,
    "FireSafety": FireSafety,
    "HealthImpact": HealthImpact,
    "KnowledgeBase": KnowledgeBase,
    "RiskMap": RiskMap,
    "UserHealth": UserHealth,
    "Zones": Zones,
    "AlertSettings": AlertSettings,
    "ActiveFireAlerts": ActiveFireAlerts,
    "AlertDetails": AlertDetails,
    "EmergencyAlertDetails": EmergencyAlertDetails,
    "AdminAlerts": AdminAlerts,
    "AdminWildfireEvents": AdminWildfireEvents,
    "Monitoring": Monitoring,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};