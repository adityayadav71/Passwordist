exports.handleError = (error) => {
  if (process.env.NODE_ENV === "production") {
    window.alert("Something went wrong! Please try again!");
  } else if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
};
