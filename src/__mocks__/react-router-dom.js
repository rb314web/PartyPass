const React = require('react');

module.exports = {
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: () => null,
  Link: ({ children, ...props }) => React.createElement('a', props, children),
  NavLink: ({ children, ...props }) => React.createElement('a', props, children),
};