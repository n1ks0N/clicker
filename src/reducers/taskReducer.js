const initialState = {
  tasks: [],
};

const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_USER_TASK":
      return {
        ...state,
        tasks: [...state["tasks"], action.task],
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: action.tasks,
      };
    case "CLEAR_TASKS":
      return {
        ...state,
        tasks: [],
      };
    default:
      return state;
  }
};

export const GetUserTasksActionCreator = (task) => ({
  type: "GET_USER_TASK",
  task: task,
});

export const UpdateTaskActionCreator = (tasks) => ({
  type: "UPDATE_TASK",
  tasks: tasks,
});

export const ClearTasksActionCreator = () => ({ type: "CLEAR_TASKS" });

export default taskReducer;
