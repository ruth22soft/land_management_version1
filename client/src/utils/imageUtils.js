const validateImage = (imagePath) => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const extension = imagePath.split('.').pop().toLowerCase();
  return validExtensions.includes(extension);
};

const getDefaultProfileImage = () => {
  return '/assets/default-profile.jpg';
};

const getDefaultLandPlanImage = () => {
  return '/assets/land-plan-placeholder.jpg';
};

export { validateImage, getDefaultProfileImage, getDefaultLandPlanImage };