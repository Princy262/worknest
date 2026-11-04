import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import { ROLES } from '../../constants';

// Loads the departments and teams the dropdowns need.
// Each role's request returns only what that role is allowed to see.
const useLookups = (role) => {
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);

  const reload = useCallback(async () => {
    try {
      const requests = [];

      if (role === ROLES.COMPANY_HEAD) {
        requests.push(api.get('/departments').then((res) => setDepartments(res.data.departments)));
      }
      if (role === ROLES.COMPANY_HEAD || role === ROLES.DEPT_HEAD) {
        requests.push(api.get('/teams').then((res) => setTeams(res.data.teams)));
      }

      await Promise.all(requests);
    } catch {
      // The lists stay empty and the forms show their own hints.
    }
  }, [role]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { departments, teams, reload };
};

export default useLookups;