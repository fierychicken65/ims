let counter = 1;

const createWorkItem = async (signal) => {
  const id = counter++;
  console.log("Created Work Item:", id, "for", signal.component_id);
  return id;
};

module.exports = { createWorkItem };