<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsContent extends Model
{
    protected $fillable = [
        'key',
        'group',
        'label',
        'type',
        'value_en',
        'value_id',
        'default_value_en',
        'default_value_id',
    ];

    public function getValueEnAttribute($value)
    {
        if ($this->type === 'json_array') {
            return json_decode($value, true);
        }
        return $value;
    }

    public function getValueIdAttribute($value)
    {
        if ($this->type === 'json_array') {
            return json_decode($value, true);
        }
        return $value;
    }

    public function setValueEnAttribute($value)
    {
        if ($this->type === 'json_array' && is_array($value)) {
            $this->attributes['value_en'] = json_encode($value);
        } else {
            $this->attributes['value_en'] = $value;
        }
    }

    public function setValueIdAttribute($value)
    {
        if ($this->type === 'json_array' && is_array($value)) {
            $this->attributes['value_id'] = json_encode($value);
        } else {
            $this->attributes['value_id'] = $value;
        }
    }

    public function getDefaultValueEnAttribute($value)
    {
        if ($this->type === 'json_array' && !is_null($value)) {
            return json_decode($value, true);
        }
        return $value;
    }

    public function getDefaultValueIdAttribute($value)
    {
        if ($this->type === 'json_array' && !is_null($value)) {
            return json_decode($value, true);
        }
        return $value;
    }
}
