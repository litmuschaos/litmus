import gql from 'graphql-tag';

export const CREATE_TODO_MUTATION = gql`
  mutation createMutation($tt: NewTodo!) {
    createTodo(input: $tt) {
      text
    }
  }
`;

export const TODO_LIST = gql`
  query getTodoList {
    todos {
      id
      text
    }
  }
`;
