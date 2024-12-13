const config = {
  screens: {
    HomeScreen: {
      path: 'home',
    },
    TaskDetailsScreen: {
      path: 'task-detail/:id',
    },
  },
};

const linking: any = {
  prefixes: ['timely://app', ],
  config,
};

export default linking;
