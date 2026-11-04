import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { ROLES, EMPLOYMENT_STATUS } from '../../constants';

// Loads the numbers each role's dashboard needs. The backend already limits every answer to what this person is allowed to see.
const useDashboardData = (role) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const countPeople = () =>
      api.get('/users', { params: { employmentStatus: EMPLOYMENT_STATUS.ACTIVE, limit: 1 } });

    const load = async () => {
      try {
        let result = {};

        if (role === ROLES.PLATFORM_OWNER) {
          const res = await api.get('/platform/companies');
          result = { companies: res.data.companies };
        } else if (role === ROLES.COMPANY_HEAD) {
          const [people, departments, teams] = await Promise.all([
            countPeople(),
            api.get('/departments'),
            api.get('/teams'),
          ]);
          result = {
            people: people.data.total,
            departments: departments.data.departments,
            teams: teams.data.teams,
          };
        } else if (role === ROLES.DEPT_HEAD) {
          const [people, teams] = await Promise.all([countPeople(), api.get('/teams')]);
          result = { people: people.data.total, teams: teams.data.teams };
        } else if (role === ROLES.TEAM_MANAGER) {
          const people = await countPeople();
          result = { people: people.data.total };
        }
        // EMPLOYEE: nothing to load, their own profile is already in Redux

        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load the dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  return { data, loading, error };
};

export default useDashboardData;