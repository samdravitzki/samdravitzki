
export default function (plop) {
  // create your generators here
  plop.setGenerator("project", {
    description: "Create a new dufus engine project with basic skeleton",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name for this project?"
      },
      {
        type: "input",
        name: "description",
        message: "What is the purpose of this project?"
      },
      {
        type: "input",
        name: "bgColor",
        message: "What background color should the canvas have? (hex)"
      }
    ],
    actions: [
        {
            type: "add",
            templateFile: "templates/project-template/project-template.hbs",
            path: "src/{{ kebabCase name }}/{{ kebabCase name }}.ts",
        },
        {
          type: "add",
          templateFile: "templates/project-template/README.hbs",
          path: "src/{{ kebabCase name }}/README.md"
        }
    ],
  });
}