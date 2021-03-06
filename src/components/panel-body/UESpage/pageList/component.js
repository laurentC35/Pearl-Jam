import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { convertSUStateInToDo, getLastState } from 'common-tools/functions';
import { formatDistanceStrict } from 'date-fns';
import D from 'i18n';

const PageList = ({
  surveyUnits,
  uesByPage,
  toggleAllSUSelection,
  toggleOneSUSelection,
  transmitButton,
  sortOnColumn,
  columnFilter,
}) => {
  const [page, setPage] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const history = useHistory();

  const intervalInDays = su => {
    const { collectionEndDate } = su;

    const remainingDays = formatDistanceStrict(new Date(), new Date(collectionEndDate), {
      roundingMethod: 'ceil',
      unit: 'day',
    });

    return remainingDays.split(' ')[0];
  };

  const checkSurveyUnit = su => {
    const { collectionStartDate } = su;
    const suTime = new Date(collectionStartDate).getTime();
    const instantTime = new Date().getTime();
    return suTime > instantTime;
  };

  const toggleAll = event => {
    const { target } = event;
    if (target.type !== 'checkbox') {
      event.stopPropagation();
    }
    toggleAllSUSelection(!selectAll);
    setSelectAll(!selectAll);
  };

  const toggleOne = (id, newValue) => {
    toggleOneSUSelection(id, newValue);
  };

  const filterPropagation = e => {
    const { target } = e;
    if (target.type !== 'checkbox') {
      e.stopPropagation();
    }
  };

  const removePostCode = str => {
    return str
      .split(' ')
      .slice(1)
      .toString();
  };

  const getClass = column => {
    if (columnFilter === undefined) return '';
    const cfColumn = columnFilter.column;
    const { order } = columnFilter;
    if (column === cfColumn) {
      return order === 'ASC' ? 'selected ascending' : 'selected descending';
    }
    return '';
  };

  const addSortIcons = () => {
    return (
      <>
        <i className="fa fa-sort-desc" aria-hidden="true" />
        <i className="fa fa-sort-asc" aria-hidden="true" />
        <i className="fa fa-sort" aria-hidden="true" />
      </>
    );
  };

  const renderSimpleTable = (sus, splitted) => {
    return (
      <>
        <table className="ue-table">
          <colgroup>
            <col className="col1" />
            <col className="col2" />
            <col className="col3" />
            <col className="col4" />
            <col className="col5" />
            <col className="col6" />
            <col className="col7" />
            <col className="col8" />
            <col className="col9" />
            <col className="col10" />
          </colgroup>
          <thead>
            <tr>
              <th className="HeaderTooltip">
                <input type="checkbox" checked={selectAll} onChange={e => toggleAll(e)} />
                <span className="tooltiptext">Tout cocher / Tout décocher</span>
              </th>
              <th
                className={getClass('campaign')}
                onClick={() => sortOnColumn('campaign')}
                onKeyPress={() => {}}
                role="button"
                tabIndex="0"
              >
                {D.surveyHeader}
                {addSortIcons()}
              </th>
              <th
                className={getClass('sampleIdentifiers')}
                onClick={() => sortOnColumn('sampleIdentifiers')}
                onKeyPress={() => {}}
                role="button"
                tabIndex="0"
              >
                {D.sampleHeader}
                {addSortIcons()}
              </th>
              <th>{D.surveyUnitHeader}</th>
              <th>{D.fullNameHeader}</th>
              <th
                className={getClass('geographicalLocation')}
                onClick={() => sortOnColumn('geographicalLocation')}
                onKeyPress={() => {}}
                role="button"
                tabIndex="0"
              >
                {D.cityHeader}
                {addSortIcons()}
              </th>
              <th
                className={getClass('toDo')}
                onClick={() => sortOnColumn('toDo')}
                onKeyPress={() => {}}
                role="button"
                tabIndex="0"
              >
                {D.toDoHeader}
                {addSortIcons()}
              </th>
              <th>{D.remainingDaysHeader}</th>
              <th
                className={getClass('priority')}
                onClick={() => sortOnColumn('priority')}
                onKeyPress={() => {}}
                role="button"
                tabIndex="0"
              >
                {D.priorityHeader}
                {addSortIcons()}
              </th>
              <th>{D.actionHeader}</th>
            </tr>
          </thead>
          <tbody>
            {sus.map(su => {
              const isDisabled = checkSurveyUnit(su);
              const rowClickFunct = () => {
                if (!isDisabled) history.push(`survey-unit/${su.id}`);
              };
              const inactive = isDisabled ? 'inactive' : '';
              return (
                <tr key={su.id} onClick={e => rowClickFunct(e)} className={inactive}>
                  <td role="gridcell" onClick={e => filterPropagation(e)}>
                    {!isDisabled && (
                      <input
                        type="checkbox"
                        checked={su.selected || false}
                        onChange={e => toggleOne(su.id, e.target.checked)}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                  </td>
                  <td>{su.campaign}</td>
                  <td>{su.sampleIdentifiers.ssech}</td>
                  <td>{su.id}</td>
                  <td>{`${su.lastName} ${su.firstName}`}</td>
                  <td>{removePostCode(su.address.l6)}</td>
                  <td>{convertSUStateInToDo(getLastState(su).type).value}</td>
                  <td className="align-right">{intervalInDays(su)}</td>
                  <td className="align-center">
                    {su.priority && (
                      <span role="img" aria-label="priority">
                        <i className="fa fa-flag" aria-hidden="true" />
                      </span>
                    )}
                  </td>
                  <td role="gridcell" className="align-center" onClick={e => e.stopPropagation()}>
                    {!isDisabled && (
                      <Link to={`/queen/questionnaire/${su.campaign}/survey-unit/${su.id}`}>
                        <span role="img" aria-label="calendar" title={D.seeSurveyUnit}>
                          <i className="fa fa-file-text-o" aria-hidden="true" />
                        </span>
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!splitted && transmitButton()}
      </>
    );
  };

  const renderTable = ues => {
    const sortedUes = ues;
    if (columnFilter === undefined) {
      sortedUes.sort(
        (ueA, ueB) =>
          ueA.collectionEndDate.toString().localeCompare(ueB.collectionEndDate.toString()) ||
          ueA.campaign.localeCompare(ueB.campaign) ||
          ueA.sampleIdentifiers.ssech - ueB.sampleIdentifiers.ssech
      );
    }

    let i;
    let j;
    let ueChunk;
    const tableSize = uesByPage || 6;
    const chunkSize = tableSize;
    if (sortedUes.length <= tableSize) {
      return renderSimpleTable(sortedUes, false);
    }
    const ueSplit = [];
    for (i = 0, j = ues.length; i < j; i += chunkSize) {
      ueChunk = sortedUes.slice(i, i + chunkSize);
      ueSplit.push(ueChunk);
    }
    return (
      <>
        {renderSimpleTable(ueSplit[page], true)}
        <div className="div-nav-page">
          {transmitButton()}
          <div>
            <button type="button" className="button-page nav" onClick={() => setPage(0)}>
              «
            </button>
            {ueSplit.map((ue, index) => (
              <button
                type="button"
                className={`button-page${index === page ? ' active' : ''}`}
                key={index}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="button-page nav"
              onClick={() => setPage(ueSplit.length - 1)}
            >
              »
            </button>
          </div>
        </div>
      </>
    );
  };

  return <>{renderTable(surveyUnits)}</>;
};

export default PageList;
