import { router } from 'redom';

import Home from 'components/home/Home';
import FourOhFour from 'components/four-oh-four/FourOhFour';

const HOME = 'home';

const routes = {
  home: Home,
  404: FourOhFour,
};

const getRoute = () => {
  const path = window.location.pathname.replace(/^\//, '');
  return path.length && Object.keys(routes).includes(path) ?
    path :
    HOME;
};

const app = router(document.body, routes);

app.update(getRoute());

// setTimeout(() => app.update('404'), 5000)

export default app;
