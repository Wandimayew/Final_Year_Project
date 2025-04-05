export const filterMenuByRole = (menuItems, userRoles) => {
  console.log("roles in the filer menus : ", userRoles);
  console.log("menus in the filer menus : ", menuItems);
  
    const hasAccess = (itemRoles) => {
      if (!itemRoles || itemRoles.length === 0) return true; // Public access
      return itemRoles.some(role => userRoles?.includes(role));
    };
  
    return menuItems
      .filter(item => hasAccess(item.roles))
      .map(item => ({
        ...item,
        subItems: item.subItems
          ? item.subItems.filter(sub => hasAccess(sub.roles))
          : undefined,
      }))
  };
  