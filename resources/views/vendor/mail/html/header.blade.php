@props(['url'])
<tr>
<td class="header" style="border-bottom: 3px solid #cfa152;">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
<img src="{{ asset('apple-touch-icon.png') }}" width="56" height="56" alt="" style="border-radius: 50%; vertical-align: middle; margin-right: 10px;">
<span style="vertical-align: middle; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: bold; color: #0c3e26;">{!! $slot !!}</span>
</a>
</td>
</tr>
