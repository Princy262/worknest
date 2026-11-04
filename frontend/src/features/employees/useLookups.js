import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import { ROLES } from '../../constants';

// Loads the departments and teams the pages and dropdowns need.
// Each role's request returns only what that role is allowed to see.
const useLookups = (role) => {
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Pages call this after creating, editing or deleting something.
  // It only changes the counter, and the effect below reacts to that.
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    const requests = [];

    if (role === ROLES.COMPANY_HEAD) {
      requests.push(
        api.get('/departments').then((res) => {
          if (!cancelled) setDepartments(res.data.departments);
        })
      );
    }
    if (role === ROLES.COMPANY_HEAD || role === ROLES.DEPT_HEAD) {
      requests.push(
        api.get('/teams').then((res) => {
          if (!cancelled) setTeams(res.data.teams);
        })
      );
    }

    Promise.all(requests)
      .then(() => {
        if (!cancelled) setError('');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Could not load the departments and teams.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    // If the page closes or the role changes mid-request, ignore the late answer
    return () => {
      cancelled = true;
    };
  }, [role, reloadKey]);

  return { departments, teams, loaded, error, reload };
};

export default useLookups;