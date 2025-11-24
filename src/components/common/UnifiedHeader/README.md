# 🎯 UnifiedHeader README

> **Status**: Phase 4.2 - Structure Created  
> **Last Updated**: 2025-01-13

---

## 📁 Folder Structure

```
UnifiedHeader/
├── UnifiedHeader.tsx         ✅ Main component with variant logic
├── UnifiedHeader.scss        ✅ Unified styles with variant modifiers
├── index.ts                  ✅ Public exports
├── README.md                 ✅ This file
├── components/               🔄 Sub-components (Phase 4.3)
│   ├── NavigationLinks/      ⏳ Navigation items (landing/auth)
│   ├── ActionsSection/       ⏳ Right-side actions
│   ├── MobileMenu/           ⏳ Unified mobile menu
│   ├── NotificationsDropdown/⏳ Notifications list
│   └── QuickActionsMenu/     ⏳ Quick actions dropdown
├── hooks/                    🔄 Custom hooks (Phase 4.4)
│   ├── useHeaderScroll.ts    ⏳ Scroll behavior
│   ├── useHeaderSearch.ts    ⏳ Search state + debouncing
│   ├── useHeaderNotifications.ts ⏳ Notifications state
│   └── useClickOutside.ts    ⏳ Click outside handler
└── utils/                    🔄 Helper utilities (Phase 4.4)
    ├── analytics.ts          ⏳ Google Analytics tracking
    └── greeting.ts           ⏳ Time-aware greeting logic
```

**Legend:**

- ✅ Completed
- 🔄 In Progress
- ⏳ Not Started

---

## 🎨 Component Overview

### Purpose

UnifiedHeader consolidates two separate Header components:

- **Header (Common)**: Landing/Login/Register pages
- **Header (Dashboard)**: Dashboard area

Into a single component with variant-based behavior.

### Variants

#### 1. **Landing** (`variant="landing"`)

- **Usage**: Public landing page
- **Features**:
  - Navigation links with icons + descriptions
  - Search functionality
  - Auth buttons (Login/Register)
  - Quick actions for authenticated users
  - Mobile menu
- **Styling**: Gradient background, 4px accent border
- **Scroll Effects**: Disabled

#### 2. **Auth** (`variant="auth"`)

- **Usage**: Login/Register pages
- **Features**:
  - Minimal UI - logo only
  - Optional auth buttons
  - No navigation
- **Styling**: Elevated background, 2px border
- **Scroll Effects**: Enabled

#### 3. **Dashboard** (`variant="dashboard"`)

- **Usage**: Dashboard area (authenticated)
- **Features**:
  - Time-aware greeting + context subtitle
  - Search with redirect to `/dashboard/search`
  - Notifications dropdown
  - Quick actions menu (5 categorized actions)
  - User menu with plan badge
  - Connection status indicator
  - Mobile sidebar toggle
- **Styling**: Surface background, 2px border
- **Scroll Effects**: Enabled with progressive blur

---

## 🔧 Props Interface

```tsx
interface UnifiedHeaderProps {
  // Required
  variant: 'landing' | 'auth' | 'dashboard';

  // Dashboard-specific
  onMobileToggle?: () => void;
  isMobileOpen?: boolean;

  // Optional feature toggles
  showSearch?: boolean; // default: true
  showNotifications?: boolean; // default: true for dashboard
  showQuickActions?: boolean; // default: true
  enableScrollEffects?: boolean; // default: false for landing
  trackingEnabled?: boolean; // default: true
}
```

---

## 📦 Usage Examples

### Landing Page

```tsx
import UnifiedHeader from '@/components/common/UnifiedHeader';

function LandingPage() {
  return (
    <>
      <UnifiedHeader variant="landing" />
      {/* Page content */}
    </>
  );
}
```

### Auth Pages (Login/Register)

```tsx
import UnifiedHeader from '@/components/common/UnifiedHeader';

function LoginPage() {
  return (
    <>
      <UnifiedHeader
        variant="auth"
        showSearch={false}
        showQuickActions={false}
      />
      {/* Login form */}
    </>
  );
}
```

### Dashboard

```tsx
import UnifiedHeader from '@/components/common/UnifiedHeader';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <UnifiedHeader
        variant="dashboard"
        onMobileToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobileOpen={isSidebarOpen}
        showNotifications={true}
        showQuickActions={true}
      />
      {/* Dashboard content */}
    </>
  );
}
```

---

## 🎯 Current Implementation Status

### Phase 4.2: Structure ✅ COMPLETED

**Created:**

- ✅ `UnifiedHeader.tsx` - Main component (300+ lines)
- ✅ `UnifiedHeader.scss` - Unified styles (280+ lines)
- ✅ `index.ts` - Public exports
- ✅ Folder structure (components/, hooks/, utils/)

**Features Implemented:**

- ✅ Variant-based rendering logic
- ✅ Props interface with full TypeScript types
- ✅ Responsive breakpoints using Phase 2 system
- ✅ Z-index hierarchy using CSS variables
- ✅ Scroll effects with progressive blur
- ✅ Mobile menu toggle logic
- ✅ Body scroll lock
- ✅ Route change listeners
- ✅ Google Analytics tracking helper
- ✅ Dark mode support
- ✅ Accessibility (ARIA labels, focus-visible)
- ✅ Reduced motion support
- ✅ Placeholder sections for Phase 4.3 components

**Styles Implemented:**

- ✅ Grid layout with 3 sections (left/center/right)
- ✅ Variant modifiers (--landing, --auth, --dashboard)
- ✅ Scrolled state with blur effect
- ✅ Mobile menu overlay with animations
- ✅ Responsive breakpoints (tablet, mobile-lg)
- ✅ Dark mode overrides
- ✅ Hover/active states
- ✅ Accessibility focus styles

---

## 🚀 Next Steps: Phase 4.3

### Sub-components to Extract

1. **NavigationLinks** (2-3 hours)
   - Extract from Header (Common)
   - Navigation items with icons + descriptions
   - Active state detection
   - Mobile responsive

2. **ActionsSection** (3-4 hours)
   - Search button/input
   - Notifications button + dropdown
   - Quick actions menu
   - User menu
   - Conditional rendering based on variant

3. **MobileMenu** (2-3 hours)
   - Unified mobile overlay
   - Navigation + auth buttons (landing/auth)
   - User menu + quick actions (dashboard)
   - Close on outside click

4. **NotificationsDropdown** (2 hours)
   - Notifications list from useNotifications
   - Mark as read functionality
   - Timestamp formatting
   - Empty state

5. **QuickActionsMenu** (1-2 hours)
   - Quick actions dropdown
   - Categorized actions
   - Icons + descriptions
   - Navigate on click

**Total Estimated Time**: 10-14 hours

---

## 📊 Benefits

### Code Reduction

- **Before**: 1,245 lines TSX + 1,300 lines SCSS = 2,545 lines
- **After**: ~600 lines main + ~300 lines sub-components = ~900 lines
- **Savings**: ~945 lines (-37%)

### Maintainability

- ✅ Single source of truth
- ✅ Reusable sub-components
- ✅ Consistent styling across variants
- ✅ Easier to add new features
- ✅ Type-safe props interface

### Performance

- ✅ Reduced bundle size
- ✅ Better code splitting
- ✅ Memoized handlers
- ✅ Conditional feature loading

---

## 🔗 Related Documentation

- `UNIFIED_HEADER_ANALYSIS.md` - Detailed analysis of differences
- `NAVIGATION_DEEP_ANALYSIS.md` - Original navigation system analysis
- `NAVIGATION_IMPLEMENTATION_STATUS.md` - Overall progress tracking
- `NAVIGATION_COMMIT_GUIDE.md` - Commit instructions

---

## 📝 Notes

- Uses Logo component from Phase 3
- Uses breakpoints system from Phase 2
- Uses z-index hierarchy from Phase 2
- Uses overlay animations from Phase 2
- Placeholders will be replaced in Phase 4.3
- Google Analytics tracking prepared but awaits sub-components
- Dark mode support included
- Full TypeScript coverage
