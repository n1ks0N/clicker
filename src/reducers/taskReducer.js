const initialState = {
  tasks: []
};

const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_USER_TASKS':
      return {
        ...state,
        tasks: [
          ...state['tasks'],
          action.tasks
        ]
      }
    case 'CLEAR_TASKS':
      return {
        ...state,
        tasks: []
      }
    default:
      return state;
  }
};

export const GetUserTasksActionCreator = (tasks) => ({ type: 'GET_USER_TASKS', tasks: tasks })

export const ClearTasksActionCreator = () => ({ type: 'CLEAR_TASKS' })

export default taskReducer;
