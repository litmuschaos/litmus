function getSearchParams(key: string): string {
  return new URL(window.location.href).searchParams.get(key) ?? '';
}

function getProjectID(): string {
  return getSearchParams('projectID');
}

function getProjectRole(): string {
  return getSearchParams('projectRole');
}

function getJwtTokenFromURL(): string {
  return getSearchParams('jwtToken');
}

export { getProjectID, getProjectRole, getJwtTokenFromURL };
