type RoutePreload = {
  match: (pathname: string) => boolean;
  load: () => Promise<unknown>;
};

const preloaded = new Set<string>();

const DASHBOARD_ROUTE_PRELOADS: RoutePreload[] = [
  {
    match: path => path === '/dashboard' || path === '/dashboard/',
    load: () => import('../components/dashboard/DashboardHome/DashboardHome'),
  },
  {
    match: path => path.startsWith('/dashboard/search'),
    load: () => import('../pages/Search/Search'),
  },
  {
    match: path => path.startsWith('/dashboard/events'),
    load: () => import('../components/dashboard/Events/Events'),
  },
  {
    match: path => path.startsWith('/dashboard/contacts'),
    load: () => import('../components/dashboard/Contacts/Contacts'),
  },
  {
    match: path => path.startsWith('/dashboard/activities'),
    load: () => import('../components/dashboard/Activities/Activities'),
  },
  {
    match: path => path.startsWith('/dashboard/analytics'),
    load: () => import('../components/dashboard/Analytics/Analytics'),
  },
  {
    match: path => path.startsWith('/dashboard/plan'),
    load: () =>
      import('../components/dashboard/Settings/PlanSettings/PlanSettings'),
  },
  {
    match: path => path.startsWith('/dashboard/settings'),
    load: () => import('../components/dashboard/Settings/Settings'),
  },
];

export const preloadDashboardRoute = (path: string): void => {
  if (preloaded.has(path)) return;

  const entry = DASHBOARD_ROUTE_PRELOADS.find(({ match }) => match(path));
  if (!entry) return;

  preloaded.add(path);
  void entry.load();
};
