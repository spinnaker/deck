import React from 'react';
import classNames from 'classnames';
import styles from './NoticeCard.module.css';

export function NoticeCard({ title, text, icon, noticeType, isActive }) {
  const NoticeCardClasses = classNames({
    [styles.NoticeCard]: true,
    [styles[noticeType]]: noticeType,
    [styles.active]: isActive,
  });
  const IconContainerClasses = classNames({
    [styles.iconContainer]: true,
    [styles[noticeType]]: noticeType,
  });

  return (
    <div className={NoticeCardClasses}>
      {icon && (
        <div className={IconContainerClasses}>
          <i className={`ico icon-${icon}`} />
        </div>
      )}
      {title && <div className={styles.title}>{title}</div>}
      {text && <div className={styles.text}>{text}</div>}
    </div>
  );
}
